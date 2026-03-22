import { useState, useRef, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

function shortAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function WalletButton() {
  const { connected, publicKey, disconnect, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleCopy() {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  if (!connected || !publicKey) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="flex flex-col items-center justify-center px-4 py-1.5 rounded-lg transition-all duration-200 cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(124,58,237,0.1))',
          border: '1px solid rgba(124, 58, 237, 0.4)',
          boxShadow: '0 0 12px rgba(124,58,237,0.15)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(124,58,237,0.4)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(124,58,237,0.7)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(124,58,237,0.15)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(124,58,237,0.4)';
        }}
      >
        <span className="text-xs text-slate-400 leading-none">Wallet</span>
        <span className="text-sm font-semibold text-purple-300 leading-tight">Connect</span>
      </button>
    );
  }

  const walletIcon = wallet?.adapter?.icon;
  const walletName = wallet?.adapter?.name ?? 'Wallet';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex flex-col items-end px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer"
        style={{
          background: 'rgba(124, 58, 237, 0.12)',
          border: '1px solid rgba(124, 58, 237, 0.35)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(124,58,237,0.6)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(124,58,237,0.35)';
        }}
      >
        <span className="text-xs text-slate-400 leading-none flex items-center gap-1">
          {walletIcon && (
            <img src={walletIcon} alt={walletName} className="w-3 h-3 rounded-sm" />
          )}
          {walletName}
        </span>
        <span className="text-sm font-semibold text-purple-300 leading-tight font-mono">
          {shortAddress(publicKey.toBase58())}
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1 w-44 rounded-lg overflow-hidden z-50"
          style={{
            background: 'linear-gradient(135deg, #0d0d1a, #0a0a15)',
            border: '1px solid rgba(124,58,237,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          <button
            onClick={handleCopy}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-purple-900/30 transition-colors flex items-center gap-2"
          >
            <span>{copied ? '✓' : '⧉'}</span>
            {copied ? 'Copied!' : 'Copy address'}
          </button>
          <button
            onClick={() => { setVisible(true); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-purple-900/30 transition-colors flex items-center gap-2"
          >
            <span>⇄</span>
            Change wallet
          </button>
          <div style={{ height: '1px', background: 'rgba(124,58,237,0.2)' }} />
          <button
            onClick={() => { disconnect(); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors flex items-center gap-2"
          >
            <span>⏻</span>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
