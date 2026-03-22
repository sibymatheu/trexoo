import { PublicKey } from '@solana/web3.js';

export function formatAddress(pubkey: PublicKey | string, chars = 4): string {
  const str = typeof pubkey === 'string' ? pubkey : pubkey.toBase58();
  if (str.length <= chars * 2 + 3) return str;
  return `${str.slice(0, chars)}...${str.slice(-chars)}`;
}

export function formatLamports(lamports: number | bigint, decimals = 4): string {
  const sol = Number(lamports) / 1_000_000_000;
  if (sol === 0) return '0.0000';
  if (sol < 0.0001) return '< 0.0001';
  return sol.toFixed(decimals);
}

// Display lamports as "USDC" for the UI (5 lamports per slot ticket logic maps to 5 USDC display)
export function formatAsUSDC(lamports: number | bigint): string {
  const amount = Number(lamports) / 1_000_000_000;
  return amount.toFixed(2);
}

export function timeAgo(timestamp: number | bigint): string {
  const ts = Number(timestamp);
  const now = Math.floor(Date.now() / 1000);
  const diff = now - ts;

  if (diff < 0) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  const days = Math.floor(diff / 86400);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

export function timeAgoMinutes(timestamp: number | bigint): string {
  const ts = Number(timestamp);
  const now = Math.floor(Date.now() / 1000);
  const diff = now - ts;

  if (diff < 60) return 'just started';
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `Started ${mins} minute${mins !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  return `Started ${hours} hour${hours !== 1 ? 's' : ''} ago`;
}

export function formatPrize(lamports: number | bigint): string {
  const sol = Number(lamports) / 1_000_000_000;
  return `${sol.toFixed(4)} SOL`;
}
