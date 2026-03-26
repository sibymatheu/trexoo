import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import { useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import { connection, useConnection } from "./useConnection";
import { type Lottery } from "../idl/lottery";
import idl from "../idl/lottery.json";

const readonlyProvider = new AnchorProvider(
  connection,
  { publicKey: Keypair.generate().publicKey, signTransaction: async (tx) => tx, signAllTransactions: async (txs) => txs },
  { commitment: "confirmed" },
);
export const readonlyProgram = new Program<Lottery>(idl as unknown as Lottery, readonlyProvider);

export function useProgram() {
  const connection = useConnection();
  const wallet = useWallet();
  const publicKeyStr = wallet.publicKey?.toBase58();

  return useMemo(() => {
    if (!wallet.connected || !wallet.publicKey) {
      return { provider: null, program: null };
    }

    const provider = new AnchorProvider(connection, wallet as unknown as AnchorProvider["wallet"], {
      commitment: "confirmed",
    });

    const program = new Program<Lottery>(idl as unknown as Lottery, provider);

    return { provider, program };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, wallet.connected, publicKeyStr]);
}
