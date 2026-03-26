import { useEffect, useState, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { connection } from "./useConnection";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { type Lottery } from "../idl/lottery";
import idl from "../idl/lottery.json";
import { readonlyProgram } from "./useProgram";
import {
  getConfigPda,
  getRoundPda,
  getRoundVaultPda,
  getTicketPda,
  getUserBalancePda,
  getUserBalanceVaultPda,
} from "./pda";

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
    participants: (r.participants as PublicKey[]).map((p) =>
      p.equals(PublicKey.default) ? "" : p.toBase58(),
    ),
    winningParticipants: (r.winningParticipants as PublicKey[]).map((p) =>
      p.equals(PublicKey.default) ? "" : p.toBase58(),
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
let fetchInFlight = false;
let roundAccountSub: number | null = null;
let subscribedRoundPda: string | null = null; // base58 of currently watched round PDA

function emit() {
  const snapshot = store;
  listeners.forEach((fn) => fn(snapshot));
}

function setStore(update: Partial<ChainState>) {
  store = { ...store, ...update };
  emit();
}

// ─── fetchChainData — fetches current round + history ─────────────────────────
async function fetchChainData() {
  if (!activeEndpoint || fetchInFlight) return;
  fetchInFlight = true;

  try {
    const programId = readonlyProgram.programId;
    const configPda = getConfigPda(programId);
    const config = await readonlyProgram.account.lotteryConfig.fetch(configPda);
    const roundBN = config.currentRound as unknown as anchor.BN;

    const roundPda = getRoundPda(programId, configPda, roundBN);
    return 0;
    const roundRaw = await readonlyProgram.account.round.fetch(roundPda);

    // Subscribe to round account changes for instant refresh
    const roundPdaStr = roundPda.toBase58();
    if (subscribedRoundPda !== roundPdaStr) {
      if (roundAccountSub !== null) {
        connection.removeAccountChangeListener(roundAccountSub);
      }
      roundAccountSub = connection.onAccountChange(
        roundPda,
        () => fetchChainData(),
        "confirmed",
      );
      subscribedRoundPda = roundPdaStr;
    }
    const parsedRound = parseRound(
      roundRaw as unknown as Record<string, unknown>,
    );

    // Fetch last 3 settled rounds in parallel
    const historyPromises: Promise<Record<string, unknown> | null>[] = [];
    for (let i = 1; i <= 3; i++) {
      const prevBN = roundBN.subn(i);
      if (prevBN.lten(0)) break;
      const prevPda = getRoundPda(programId, configPda, prevBN);
      historyPromises.push(
        readonlyProgram.account.round
          .fetch(prevPda)
          .then((r) => r as unknown as Record<string, unknown>)
          .catch(() => null),
      );
    }
    const historyResults = await Promise.all(historyPromises);
    const history: HistoricalRound[] = (
      historyResults.filter(Boolean) as Record<string, unknown>[]
    )
      .map(parseRound)
      .filter((r) => r.status === "Settled")
      .map(buildHistory);

    // Track when each round was first seen
    const storageKey = `round_start_${parsedRound.roundNumber}`;
    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, String(Math.floor(Date.now() / 1000)));
    }
    parsedRound.startedAt = Number(localStorage.getItem(storageKey));

    setStore({
      currentRound: parsedRound,
      historicalRounds: history,
      programReady: true,
      loading: false,
    });
  } catch (err) {
    console.error("fetchChainData failed:", err);
    setStore({ loading: false });
  } finally {
    fetchInFlight = false;
  }
}

function startPolling(endpoint: string) {
  if (pollingInterval && activeEndpoint === endpoint) return;
  if (pollingInterval) clearInterval(pollingInterval);

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
  if (roundAccountSub !== null) {
    connection.removeAccountChangeListener(roundAccountSub);
    roundAccountSub = null;
    subscribedRoundPda = null;
  }
  activeEndpoint = null;
}

// ─── The hook ─────────────────────────────────────────────────────────────────

export function useLotteryProgram() {
  const wallet = useWallet();
  const walletRef = useRef(wallet);
  walletRef.current = wallet;

  const [chainState, setChainState] = useState<ChainState>(store);

  // Chain data polling
  useEffect(() => {
    const listener: Listener = (s) => setChainState(s);
    listeners.add(listener);
    startPolling(connection.rpcEndpoint);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) stopPolling();
    };
  }, []);

  // Per-wallet state
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

  // Fetch wallet-specific data when wallet or round changes
  useEffect(() => {
    const pk = wallet.publicKey;
    if (!pk) {
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

    async function fetchWalletData() {
      if (!pk) return;
      try {
        // SOL balance
        const lamports = await connection.getBalance(pk);
        if (!cancelled) setSolBalance(lamports / LAMPORTS_PER_SOL);

        // User ticket in current round
        const programId = readonlyProgram.programId;
        const configPda = getConfigPda(programId);
        const roundBN = new anchor.BN(chainState.currentRound.roundNumber);
        const roundPda = getRoundPda(programId, configPda, roundBN);
        const ticketPda = getTicketPda(programId, roundPda, pk);
        try {
          const ticket = await readonlyProgram.account.ticket.fetch(ticketPda);
          if (!cancelled)
            setUserTicket({ slotIndex: ticket.slotIndex as number });
        } catch {
          if (!cancelled) setUserTicket(null);
        }

        // User balance account
        const userBalancePda = getUserBalancePda(programId, pk);
        try {
          const bal =
            await readonlyProgram.account.userBalance.fetch(userBalancePda);
          if (!cancelled)
            setUserBalance({
              balance: BigInt((bal.balance as anchor.BN).toString()),
              totalWon: BigInt((bal.totalWon as anchor.BN).toString()),
              totalWithdrawn: BigInt(
                (bal.totalWithdrawn as anchor.BN).toString(),
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
      } catch (err) {
        console.error("fetchWalletData failed:", err);
      }
    }

    fetchWalletData();
    return () => {
      cancelled = true;
    };
  }, [wallet.publicKey, chainState.currentRound.roundNumber]);

  // ─── buyTicket ────────────────────────────────────────────────────────────
  async function buyTicket(slotIndex: number): Promise<boolean> {
    const w = walletRef.current;
    if (!w.publicKey) {
      setError("Please connect your wallet first");
      return false;
    }
    if (!w.signTransaction) {
      setError("Wallet does not support signing");
      return false;
    }
    if (!chainState.programReady) {
      setError("No active round yet. Please wait.");
      return false;
    }

    setTxLoading(true);
    setError(null);
    try {
      const provider = new anchor.AnchorProvider(
        connection,
        w as unknown as anchor.AnchorProvider["wallet"],
        { commitment: "confirmed" },
      );
      const program = new anchor.Program<Lottery>(
        idl as unknown as Lottery,
        provider,
      );

      const programId = program.programId;
      const buyer = w.publicKey;
      const configPda = getConfigPda(programId);
      const config = await program.account.lotteryConfig.fetch(configPda);
      const currentRound = config.currentRound as unknown as anchor.BN;
      const nextRound = currentRound.addn(1);

      const roundPda = getRoundPda(programId, configPda, currentRound);
      const roundVaultPda = getRoundVaultPda(
        programId,
        configPda,
        currentRound,
      );
      const ticketPda = getTicketPda(programId, roundPda, buyer);
      const newRoundPda = getRoundPda(programId, configPda, nextRound);
      const newRoundVaultPda = getRoundVaultPda(
        programId,
        configPda,
        nextRound,
      );

      await program.methods
        .buyTicket(slotIndex)
        .accountsPartial({
          config: configPda,
          round: roundPda,
          roundVault: roundVaultPda,
          ticket: ticketPda,
          buyer,
          feeWallet: config.feeWallet as PublicKey,
          newRound: newRoundPda,
          newRoundVault: newRoundVaultPda,
        })
        .rpc();

      fetchChainData(); // fire-and-forget — don't block txLoading reset
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      return false;
    } finally {
      setTxLoading(false);
    }
  }

  // ─── withdrawBalance ──────────────────────────────────────────────────────
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

    setTxLoading(true);
    setError(null);
    try {
      const provider = new anchor.AnchorProvider(
        connection,
        w as unknown as anchor.AnchorProvider["wallet"],
        { commitment: "confirmed" },
      );
      const program = new anchor.Program<Lottery>(
        idl as unknown as Lottery,
        provider,
      );

      const programId = program.programId;
      const user = w.publicKey;
      const userBalancePda = getUserBalancePda(programId, user);
      const userBalanceVaultPda = getUserBalanceVaultPda(programId, user);

      await program.methods
        .withdraw(new anchor.BN(amount.toString()))
        .accountsPartial({
          userBalance: userBalancePda,
          userBalanceVault: userBalanceVaultPda,
          user,
        })
        .rpc();

      // Refresh balance
      const bal = await program.account.userBalance.fetch(userBalancePda);
      setUserBalance({
        balance: BigInt((bal.balance as anchor.BN).toString()),
        totalWon: BigInt((bal.totalWon as anchor.BN).toString()),
        totalWithdrawn: BigInt((bal.totalWithdrawn as anchor.BN).toString()),
      });
      const lamports = await connection.getBalance(user);
      setSolBalance(lamports / LAMPORTS_PER_SOL);

      return true;
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
