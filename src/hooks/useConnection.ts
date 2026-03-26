import { Connection } from "@solana/web3.js";

const RPC_ENDPOINT = import.meta.env.VITE_RPC_ENDPOINT as string;
const REQUEST_TIMEOUT_MS = 10_000;

export const connection = new Connection(RPC_ENDPOINT, {
  commitment: "confirmed",
  fetch: (input, init) =>
    fetch(input, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }),
});

export function useConnection() {
  return connection;
}
