import { useEffect, useState, useRef } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import idl from "../idl/lottery.json";

const PROGRAM_ID = new PublicKey(
  "A9C45R9BG3UAsa5SdKXPTzAZad3ZKt5Yt1NEwn79ra6D",
);

const READONLY_WALLET = {
  publicKey: PublicKey.default,
  signTransaction: async <T>(tx: T) => tx,
  signAllTransactions: async <T>(txs: T[]) => txs,
} as unknown as anchor.Wallet;

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface RoundData {
  roundNumber: number;
  slots: number;
  slotsFilled: number;
  pool: bigint;
  status: "Open" | "Full" | "Settled";
  participants: string[];
  winningParticipants: string[];
  firstWinnerIdx: number;
  secondWinnersStartIdx: number;
  thirdWinnersStartIdx: number;
  firstPrize: bigint;
  secondPrizeEach: bigint;
  thirdPrizeEach: bigint;
  startedAt: number;
  fee: bigint;
}

export interface UserBalanceData {
  balance: bigint;
  totalWon: bigint;
  totalWithdrawn: bigint;
}

export interface HistoricalRound {
  roundNumber: number;
  winners: {
    address: string;
    tier: "first" | "second" | "third";
    prize: bigint;
  }[];
  pool: bigint;
  settledAt?: number;
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

const DEFAULT_ROUND: RoundData = {
  roundNumber: 1,
  slots: 10,
  slotsFilled: 0,
  pool: BigInt(0),
  status: "Open",
  participants: [],
  winningParticipants: [],
  firstWinnerIdx: 0,
  secondWinnersStartIdx: 1,
  thirdWinnersStartIdx: 3,
  firstPrize: BigInt(0),
  secondPrizeEach: BigInt(0),
  thirdPrizeEach: BigInt(0),
  startedAt: 0,
  fee: BigInt(0),
};

function parseStatus(s: Record<string, unknown>): "Open" | "Full" | "Settled" {
  if ("open" in s) return "Open";
  if ("full" in s) return "Full";
  if ("settled" in s) return "Settled";
  return "Open";
}

function parseRound(r: Record<string, unknown>): RoundData {
  return {
    roundNumber: Number(r.roundNumber),
    slots: r.slots as number,
    slotsFilled: r.slotsFilled as number,
    pool: BigInt((r.pool as anchor.BN).toString()),
    status: parseStatus(r.status as Record<string, unknown>),
    participants: (r.participants as PublicKey[]).map((p) => p.toBase58()),
    winningParticipants: (r.winningParticipants as PublicKey[]).map((p) =>
      p.toBase58(),
    ),
    firstWinnerIdx: r.firstWinnerIdx as number,
    secondWinnersStartIdx: r.secondWinnersStartIdx as number,
    thirdWinnersStartIdx: r.thirdWinnersStartIdx as number,
    firstPrize: BigInt((r.firstPrize as anchor.BN).toString()),
    secondPrizeEach: BigInt((r.secondPrizeEach as anchor.BN).toString()),
    thirdPrizeEach: BigInt((r.thirdPrizeEach as anchor.BN).toString()),
    startedAt: 0,
    fee: BigInt((r.fee as anchor.BN).toString()),
  };
}

function buildHistory(round: RoundData): HistoricalRound {
  const winners: HistoricalRound["winners"] = [];
  const wp = round.winningParticipants;
  if (wp.length > round.firstWinnerIdx)
    winners.push({
      address: wp[round.firstWinnerIdx],
      tier: "first",
      prize: round.firstPrize,
    });
  for (let i = round.secondWinnersStartIdx; i < round.thirdWinnersStartIdx; i++)
    if (wp[i])
      winners.push({
        address: wp[i],
        tier: "second",
        prize: round.secondPrizeEach,
      });
  for (let i = round.thirdWinnersStartIdx; i < wp.length; i++)
    if (wp[i])
      winners.push({
        address: wp[i],
        tier: "third",
        prize: round.thirdPrizeEach,
      });
  return { roundNumber: round.roundNumber, winners, pool: round.pool };
}

function getConfigPDA(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    PROGRAM_ID,
  );
  return pda;
}

function getRoundPDA(configPda: PublicKey, roundBN: anchor.BN): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("round"),
      configPda.toBuffer(),
      roundBN.toArrayLike(Buffer, "le", 8),
    ],
    PROGRAM_ID,
  );
  return pda;
}

// ─── Connection factory with per-request abort signal ─────────────────────────

function makeConnection(endpoint: string, signal?: AbortSignal): Connection {
  return new Connection(endpoint, {
    commitment: "confirmed",
    fetch: (input, init) => {
      if (signal?.aborted)
        return Promise.reject(new DOMException("Aborted", "AbortError"));
      return fetch(input, { ...init, signal });
    },
  });
}

// ─── Module-level singleton store ─────────────────────────────────────────────

interface ChainState {
  currentRound: RoundData;
  historicalRounds: HistoricalRound[];
  loading: boolean;
  programReady: boolean;
}

let store: ChainState = {
  currentRound: DEFAULT_ROUND,
  historicalRounds: [],
  loading: false,
  programReady: false,
};

type Listener = (state: ChainState) => void;
const listeners = new Set<Listener>();
let pollingInterval: ReturnType<typeof setInterval> | null = null;
let activeEndpoint: string | null = null;
let fetchController: AbortController | null = null;

function emit() {
  const snapshot = store;
  listeners.forEach((fn) => fn(snapshot));
}

function setStore(update: Partial<ChainState>) {
  store = { ...store, ...update };
  emit();
}

// ─── [1] fetchChainData — fetches current round + history ─────────────────────
// Uncomment to enable live on-chain round data
async function fetchChainData() {
  if (!activeEndpoint) return;

  // Abort any previous in-flight fetch — prevents request pile-up
  fetchController?.abort();
  fetchController = new AbortController();
  const { signal } = fetchController;

  try {
    // conn / provider / program / configPda are used when calls below are enabled
    // const conn = makeConnection(activeEndpoint, signal);
    // const provider = new anchor.AnchorProvider(conn, READONLY_WALLET, { commitment: "confirmed" });
    // const program = new anchor.Program(idl as anchor.Idl, provider);
    // const configPda = getConfigPDA();

    // ── [CALL-1] lotteryConfig.fetch ─────────────────────────────────────────
    // Enable first. Fetches the on-chain config to get the current round number.
    // const config = (await (program.account as any).lotteryConfig.fetch(configPda)) as Record<string, unknown>;
    const config: Record<string, unknown> = { currentRound: new anchor.BN(1), feeWallet: PublicKey.default };
    if (signal.aborted) return;

    const roundBN = anchor.BN.isBN(config.currentRound)
      ? (config.currentRound as anchor.BN)
      : new anchor.BN((config.currentRound as { toString(): string }).toString());

    // ── [CALL-2] round.fetch (current) ───────────────────────────────────────
    // Enable after [CALL-1] works. Fetches the current round account.
    // const roundPda = getRoundPDA(configPda, roundBN);
    // const round = (await (program.account as any).round.fetch(roundPda)) as Record<string, unknown>;
    const round: Record<string, unknown> = {
      roundNumber: roundBN, slots: 10, slotsFilled: 0, pool: new anchor.BN(0),
      status: { open: {} }, participants: [], winningParticipants: [],
      firstWinnerIdx: 0, secondWinnersStartIdx: 1, thirdWinnersStartIdx: 3,
      firstPrize: new anchor.BN(0), secondPrizeEach: new anchor.BN(0),
      thirdPrizeEach: new anchor.BN(0), fee: new anchor.BN(0),
    };
    if (signal.aborted) return;

    const parsedRound = parseRound(round);

    // ── [CALL-3] round.fetch × 3 (history, parallel) ─────────────────────────
    // Enable after [CALL-2] works. Fetches last 3 settled rounds in parallel.
    // const historyPromises: Promise<Record<string, unknown> | null>[] = [];
    // for (let i = 1; i <= 3; i++) {
    //   const prevBN = roundBN.subn(i);
    //   if (prevBN.lten(0)) break;
    //   historyPromises.push(
    //     (program.account as any).round.fetch(getRoundPDA(configPda, prevBN)).catch(() => null),
    //   );
    // }
    // const historyResults = await Promise.all(historyPromises);
    const historyResults: (Record<string, unknown> | null)[] = [];
    if (signal.aborted) return;

    const history: HistoricalRound[] = (historyResults.filter(Boolean) as Record<string, unknown>[])
      .map(parseRound)
      .filter((p) => p.status === "Settled")
      .map(buildHistory);

    // Track when each round was first seen — used for "started X ago" display
    const storageKey = `round_start_${parsedRound.roundNumber}`;
    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, String(Math.floor(Date.now() / 1000)));
    }
    parsedRound.startedAt = Number(localStorage.getItem(storageKey));

    setStore({ currentRound: parsedRound, historicalRounds: history, programReady: true, loading: false });
  } catch (err) {
    if ((err as { name?: string }).name === "AbortError") return;
    console.error("fetchChainData failed:", err);
    setStore({ loading: false });
  }
}

// -- MOCK fetchChainData — used while contract calls are commented out ---------
// Remove this and uncomment the real fetchChainData above when ready
/* [MOCK]
async function fetchChainData() {
  await new Promise((r) => setTimeout(r, 300)); // simulate network delay
  setStore({
    currentRound: {
      ...DEFAULT_ROUND,
      roundNumber: 5,
      slotsFilled: 3,
      pool: BigInt(3_000_000_000),
      participants: [
        "FakeAddr1111111111111111111111111111111111",
        "FakeAddr2222222222222222222222222222222222",
        "FakeAddr3333333333333333333333333333333333",
      ],
      fee: BigInt(50_000_000),
    },
    historicalRounds: [
      {
        roundNumber: 4,
        pool: BigInt(10_000_000_000),
        winners: [
          { address: "WinnerAddr111111111111111111111111111111111", tier: "first", prize: BigInt(5_000_000_000) },
          { address: "WinnerAddr222222222222222222222222222222222", tier: "second", prize: BigInt(2_000_000_000) },
          { address: "WinnerAddr333333333333333333333333333333333", tier: "third", prize: BigInt(500_000_000) },
        ],
      },
    ],
    programReady: true,
    loading: false,
  });
}
*/

function startPolling(endpoint: string) {
  if (pollingInterval && activeEndpoint === endpoint) return;

  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  fetchController?.abort();
  fetchController = null;

  activeEndpoint = endpoint;
  setStore({ loading: true, programReady: false });
  fetchChainData();
  pollingInterval = setInterval(fetchChainData, 10000);
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  fetchController?.abort();
  fetchController = null;
  activeEndpoint = null;
}

// ─── The hook ─────────────────────────────────────────────────────────────────

export function useLotteryProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const walletRef = useRef(wallet);
  walletRef.current = wallet;

  const [chainState, setChainState] = useState<ChainState>(store);

  // ─── [EFFECT-1] Chain data polling ────────────────────────────────────────
  // Subscribes to singleton store and starts polling the RPC for round data.
  useEffect(() => {
    const listener: Listener = (s) => setChainState(s);
    listeners.add(listener);
    startPolling(connection.rpcEndpoint);

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) stopPolling();
    };
  }, [connection]);

  // MOCK [EFFECT-1] — re-enable if EFFECT-1 causes hangs
  /*
  useEffect(() => {
    setChainState({
      currentRound: {
        ...DEFAULT_ROUND,
        roundNumber: 5,
        slotsFilled: 3,
        pool: BigInt(3_000_000_000),
        startedAt: Math.floor(Date.now() / 1000) - 3720, // ~1 hour ago
        participants: [
          "FakeAddr1111111111111111111111111111111111",
          "FakeAddr2222222222222222222222222222222222",
          "FakeAddr3333333333333333333333333333333333",
        ],
        fee: BigInt(50_000_000),
      },
      historicalRounds: [
        {
          roundNumber: 4,
          pool: BigInt(10_000_000_000),
          winners: [
            { address: "WinnerAddr111111111111111111111111111111111", tier: "first", prize: BigInt(5_000_000_000) },
            { address: "WinnerAddr222222222222222222222222222222222", tier: "second", prize: BigInt(2_000_000_000) },
            { address: "WinnerAddr333333333333333333333333333333333", tier: "third", prize: BigInt(500_000_000) },
          ],
        },
      ],
      programReady: true,
      loading: false,
    });
  }, []);
  */

  // ── Per-wallet state ──────────────────────────────────────────────────────

  const [userTicket, setUserTicket] = useState<{ slotIndex: number } | null>(
    null,
  );
  const [userBalance, setUserBalance] = useState<UserBalanceData>({
    balance: BigInt(0),
    totalWon: BigInt(0),
    totalWithdrawn: BigInt(0),
  });
  const [solBalance, setSolBalance] = useState<number>(0);
  const [txLoading, setTxLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── [2] fetchWalletData — fetches SOL balance, ticket, user balance ────────
  // Uncomment each section inside to enable
  useEffect(() => {
    const pk = wallet.publicKey;
    if (!pk || !activeEndpoint) {
      setUserTicket(null);
      setUserBalance({
        balance: BigInt(0),
        totalWon: BigInt(0),
        totalWithdrawn: BigInt(0),
      });
      setSolBalance(0);
      return;
    }

    let cancelled = false;
    const ctrl = new AbortController();

    async function fetchWalletData() {
      if (!pk || !activeEndpoint) return;
      const conn = makeConnection(activeEndpoint, ctrl.signal);

      // -- [2a] SOL balance ---------------------------------------------------
      /* [CONTRACT] getBalance */
      try {
        const bal = await conn.getBalance(pk);
        if (!cancelled) setSolBalance(bal);
      } catch {
        /* ignore */
      }

      try {
        const provider = new anchor.AnchorProvider(conn, READONLY_WALLET, {
          commitment: "confirmed",
        });
        const program = new anchor.Program(idl as anchor.Idl, provider);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const accounts = program.account as any;

        const configPda = getConfigPDA();
        /* [CONTRACT] lotteryConfig.fetch (wallet data) */
        const config = (await accounts.lotteryConfig.fetch(
          configPda,
        )) as Record<string, unknown>;
        if (cancelled) return;

        const roundBN = anchor.BN.isBN(config.currentRound)
          ? (config.currentRound as anchor.BN)
          : new anchor.BN(
              (config.currentRound as { toString(): string }).toString(),
            );
        const roundPda = getRoundPDA(configPda, roundBN);

        // -- [2b] User ticket -------------------------------------------------
        /* [CONTRACT] ticket.fetch */
        try {
          const [ticketPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("ticket"), roundPda.toBuffer(), pk.toBuffer()],
            PROGRAM_ID,
          );
          const ticket = (await accounts.ticket.fetch(ticketPda)) as Record<
            string,
            unknown
          >;
          if (!cancelled)
            setUserTicket({ slotIndex: ticket.slotIndex as number });
        } catch {
          if (!cancelled) setUserTicket(null);
        }

        // -- [2c] User balance ------------------------------------------------
        /* [CONTRACT] userBalance.fetch */
        try {
          const [ubPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("user_balance"), pk.toBuffer()],
            PROGRAM_ID,
          );
          const ub = (await accounts.userBalance.fetch(ubPda)) as Record<
            string,
            unknown
          >;
          if (!cancelled)
            setUserBalance({
              balance: BigInt((ub.balance as anchor.BN).toString()),
              totalWon: BigInt((ub.totalWon as anchor.BN).toString()),
              totalWithdrawn: BigInt(
                (ub.totalWithdrawn as anchor.BN).toString(),
              ),
            });
        } catch {
          if (!cancelled)
            setUserBalance({
              balance: BigInt(0),
              totalWon: BigInt(0),
              totalWithdrawn: BigInt(0),
            });
        }
      } catch {
        /* ignore */
      }
    }

    fetchWalletData();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [wallet.publicKey, chainState.currentRound.roundNumber]);

  // ── Transactions ──────────────────────────────────────────────────────────

  // ─── [3] buyTicket ────────────────────────────────────────────────────────
  async function buyTicket(): Promise<boolean> {
    const w = walletRef.current;
    if (!w.publicKey) {
      setError("Please connect your wallet first");
      return false;
    }
    if (!chainState.programReady) {
      setError("No active round yet. Please wait.");
      return false;
    }
    if (!w.signTransaction) {
      setError("Wallet does not support signing");
      return false;
    }
    if (!activeEndpoint) {
      setError("No connection");
      return false;
    }

    setTxLoading(true);
    setError(null);
    try {
      /* [CONTRACT] buyTicket transaction — uncomment to enable */
      const conn = makeConnection(activeEndpoint);
      const provider = new anchor.AnchorProvider(
        conn,
        w as unknown as anchor.Wallet,
        { commitment: "confirmed" },
      );
      const program = new anchor.Program(idl as anchor.Idl, provider);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const accounts = program.account as any;

      const configPda = getConfigPDA();
      const config = (await accounts.lotteryConfig.fetch(configPda)) as Record<
        string,
        unknown
      >;

      const roundBN = anchor.BN.isBN(config.currentRound)
        ? (config.currentRound as anchor.BN)
        : new anchor.BN(
            (config.currentRound as { toString(): string }).toString(),
          );
      const nextRoundBN = roundBN.addn(1);

      const roundPda = getRoundPDA(configPda, roundBN);
      const [roundVaultPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("round_vault"),
          configPda.toBuffer(),
          roundBN.toArrayLike(Buffer, "le", 8),
        ],
        PROGRAM_ID,
      );
      const [ticketPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("ticket"), roundPda.toBuffer(), w.publicKey.toBuffer()],
        PROGRAM_ID,
      );
      const newRoundPda = getRoundPDA(configPda, nextRoundBN);
      const [newRoundVaultPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("round_vault"),
          configPda.toBuffer(),
          nextRoundBN.toArrayLike(Buffer, "le", 8),
        ],
        PROGRAM_ID,
      );

      /* [CONTRACT] buyTicket .rpc() */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (program.methods as any)
        .buyTicket()
        .accountsPartial({
          config: configPda,
          round: roundPda,
          roundVault: roundVaultPda,
          ticket: ticketPda,
          buyer: w.publicKey,
          feeWallet: config.feeWallet as PublicKey,
          newRound: newRoundPda,
          newRoundVault: newRoundVaultPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      await fetchChainData();
      return true;

      // -- MOCK buyTicket (remove above block and uncomment to test UI) -------
      /*
      await new Promise((r) => setTimeout(r, 1000));
      return true;
      */
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      return false;
    } finally {
      setTxLoading(false);
    }
  }

  // ─── [4] withdrawBalance ──────────────────────────────────────────────────
  async function withdrawBalance(amount: bigint): Promise<boolean> {
    const w = walletRef.current;
    if (!w.publicKey) {
      setError("Please connect your wallet first");
      return false;
    }
    if (!w.signTransaction) {
      setError("Wallet does not support signing");
      return false;
    }
    if (!activeEndpoint) {
      setError("No connection");
      return false;
    }

    setTxLoading(true);
    setError(null);
    try {
      /* [CONTRACT] withdraw transaction — uncomment to enable */
      const conn = makeConnection(activeEndpoint);
      const provider = new anchor.AnchorProvider(
        conn,
        w as unknown as anchor.Wallet,
        { commitment: "confirmed" },
      );
      const program = new anchor.Program(idl as anchor.Idl, provider);

      const [userBalancePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_balance"), w.publicKey.toBuffer()],
        PROGRAM_ID,
      );
      const [userBalanceVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_balance_vault"), w.publicKey.toBuffer()],
        PROGRAM_ID,
      );

      /* [CONTRACT] withdraw .rpc() */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (program.methods as any)
        .withdraw(new anchor.BN(amount.toString()))
        .accounts({
          userBalance: userBalancePda,
          userBalanceVault: userBalanceVaultPda,
          user: w.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      return true;

      // -- MOCK withdraw (remove above block and uncomment to test UI) --------
      /*
      await new Promise((r) => setTimeout(r, 1000));
      return true;
      */
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal failed");
      return false;
    } finally {
      setTxLoading(false);
    }
  }

  return {
    currentRound: chainState.currentRound,
    historicalRounds: chainState.historicalRounds,
    loading: chainState.loading,
    programReady: chainState.programReady,
    userTicket,
    userBalance,
    solBalance,
    txLoading,
    error,
    setError,
    buyTicket,
    withdrawBalance,
    isConnected: wallet.connected,
    walletPublicKey: wallet.publicKey?.toBase58() ?? null,
  };
}
