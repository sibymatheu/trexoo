import { useState } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useLotteryProgram } from '../hooks/useLotteryProgram';
import { formatLamports } from '../utils/format';

export default function WithdrawPage() {
  const { userBalance, isConnected, txLoading, error, setError, withdrawBalance } = useLotteryProgram();
  const [amount, setAmount] = useState('');
  const [txSuccess, setTxSuccess] = useState(false);

  const balanceSol = Number(userBalance.balance) / LAMPORTS_PER_SOL;
  const totalWonSol = Number(userBalance.totalWon) / LAMPORTS_PER_SOL;
  const totalWithdrawnSol = Number(userBalance.totalWithdrawn) / LAMPORTS_PER_SOL;

  const handleWithdraw = async () => {
    setError(null);
    const amountSol = parseFloat(amount);
    if (isNaN(amountSol) || amountSol <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (amountSol > balanceSol) {
      setError('Amount exceeds available balance');
      return;
    }

    const lamports = BigInt(Math.floor(amountSol * LAMPORTS_PER_SOL));
    const success = await withdrawBalance(lamports);
    if (success) {
      setTxSuccess(true);
      setAmount('');
      setTimeout(() => setTxSuccess(false), 5000);
    }
  };

  const handleMaxAmount = () => {
    setAmount(balanceSol.toFixed(6));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="anim-fade-down text-center mb-8">
        <div className="text-4xl mb-3">💸</div>
        <h1
          className="text-3xl font-black mb-2"
          style={{
            fontFamily: "'Cinzel Decorative', Georgia, serif",
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Withdraw Winnings
        </h1>
        <p className="text-slate-400 text-sm">
          Withdraw your prize balance to your connected wallet
        </p>
      </div>

      {/* Not connected state */}
      {!isConnected && (
        <div
          className="anim-fade-in rounded-xl p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, #0d0d1a 0%, #0a0a15 100%)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
          }}
        >
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-white mb-2">Wallet Not Connected</h2>
          <p className="text-slate-400 text-sm">
            Please connect your Phantom wallet to view and withdraw your winnings.
          </p>
        </div>
      )}

      {isConnected && (
        <div className="space-y-4">
          {/* Balance overview cards */}
          <div className="anim-fade-up grid grid-cols-3 gap-3">
            <div
              className="rounded-xl p-4 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,165,0,0.05))',
                border: '1px solid rgba(255,215,0,0.2)',
              }}
            >
              <div className="text-xs text-slate-400 mb-1 uppercase tracking-wide">Available</div>
              <div className="text-xl font-black" style={{ color: '#FFD700' }}>{balanceSol.toFixed(4)}</div>
              <div className="text-xs text-slate-500">SOL</div>
            </div>

            <div
              className="rounded-xl p-4 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(4,120,87,0.04))',
                border: '1px solid rgba(16,185,129,0.15)',
              }}
            >
              <div className="text-xs text-slate-400 mb-1 uppercase tracking-wide">Total Won</div>
              <div className="text-xl font-black text-emerald-400">{totalWonSol.toFixed(4)}</div>
              <div className="text-xs text-slate-500">SOL</div>
            </div>

            <div
              className="rounded-xl p-4 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(91,33,182,0.04))',
                border: '1px solid rgba(124,58,237,0.15)',
              }}
            >
              <div className="text-xs text-slate-400 mb-1 uppercase tracking-wide">Withdrawn</div>
              <div className="text-xl font-black text-purple-400">{totalWithdrawnSol.toFixed(4)}</div>
              <div className="text-xs text-slate-500">SOL</div>
            </div>
          </div>

          {/* Notifications */}
          {error && (
            <div
              className="anim-fade-down px-4 py-3 rounded-xl flex items-center justify-between"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
              }}
            >
              <span className="text-sm">{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 ml-3 text-lg">✕</button>
            </div>
          )}

          {txSuccess && (
            <div
              className="anim-fade-down px-4 py-3 rounded-xl"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#6ee7b7',
              }}
            >
              <span className="text-sm">✅ Withdrawal successful! SOL has been sent to your wallet.</span>
            </div>
          )}

          {/* Withdraw form */}
          <div
            className="anim-fade-up anim-delay-1 rounded-xl p-6"
            style={{
              background: 'linear-gradient(135deg, #0d0d1a 0%, #0a0a15 100%)',
              border: '1px solid rgba(124, 58, 237, 0.2)',
            }}
          >
            <h3 className="text-base font-bold text-white mb-4">Withdraw to Wallet</h3>

            {balanceSol <= 0 ? (
              <div
                className="rounded-xl p-6 text-center"
                style={{
                  background: 'rgba(124, 58, 237, 0.05)',
                  border: '1px dashed rgba(124, 58, 237, 0.2)',
                }}
              >
                <div className="text-3xl mb-2">💰</div>
                <p className="text-slate-400 text-sm">No winnings available to withdraw.</p>
                <p className="text-slate-500 text-xs mt-1">Participate in a round to win SOL prizes!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Amount input */}
                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-wide mb-2">
                    Amount (SOL)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.0000"
                      step="0.0001"
                      min="0"
                      max={balanceSol}
                      className="w-full px-4 py-3 pr-20 rounded-xl text-white text-lg font-semibold outline-none focus:ring-2 transition-all"
                      style={{
                        background: 'rgba(124, 58, 237, 0.1)',
                        border: '1px solid rgba(124, 58, 237, 0.3)',
                        color: 'white',
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = 'rgba(124, 58, 237, 0.7)';
                        e.target.style.boxShadow = '0 0 15px rgba(124, 58, 237, 0.2)';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'rgba(124, 58, 237, 0.3)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <span className="text-slate-400 text-sm">SOL</span>
                      <button
                        onClick={handleMaxAmount}
                        className="text-xs font-bold px-2 py-1 rounded transition-all"
                        style={{
                          background: 'rgba(255, 215, 0, 0.15)',
                          color: '#FFD700',
                          border: '1px solid rgba(255, 215, 0, 0.3)',
                        }}
                      >
                        MAX
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Available: <span style={{ color: '#FFD700' }}>{formatLamports(userBalance.balance)} SOL</span>
                  </p>
                </div>

                {/* Quick amount buttons */}
                <div className="flex gap-2">
                  {[0.25, 0.5, 0.75, 1.0].map(fraction => {
                    const val = (balanceSol * fraction).toFixed(4);
                    return (
                      <button
                        key={fraction}
                        onClick={() => setAmount(val)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: 'rgba(124, 58, 237, 0.1)',
                          border: '1px solid rgba(124, 58, 237, 0.2)',
                          color: '#a78bfa',
                        }}
                      >
                        {fraction * 100}%
                      </button>
                    );
                  })}
                </div>

                {/* Withdraw button */}
                <button
                  onClick={handleWithdraw}
                  disabled={txLoading || !amount || parseFloat(amount) <= 0}
                  className="w-full py-4 rounded-xl text-base font-bold transition-all active:scale-[0.99]"
                  style={{
                    background: txLoading || !amount || parseFloat(amount) <= 0
                      ? 'rgba(255, 215, 0, 0.2)'
                      : 'linear-gradient(135deg, #FFD700, #FFA500)',
                    color: txLoading || !amount || parseFloat(amount) <= 0 ? '#78716c' : '#000',
                    cursor: txLoading || !amount || parseFloat(amount) <= 0 ? 'not-allowed' : 'pointer',
                    boxShadow: txLoading || !amount || parseFloat(amount) <= 0
                      ? 'none'
                      : '0 0 25px rgba(255, 215, 0, 0.4)',
                  }}
                >
                  {txLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: '#000', borderColor: 'rgba(0,0,0,0.3)' }} />
                      Processing...
                    </span>
                  ) : (
                    `Withdraw ${amount ? parseFloat(amount).toFixed(4) : '0.0000'} SOL`
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Info box */}
          <div
            className="anim-fade-in anim-delay-3 rounded-xl p-4"
            style={{
              background: 'rgba(124, 58, 237, 0.05)',
              border: '1px solid rgba(124, 58, 237, 0.12)',
            }}
          >
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              About Winnings
            </h4>
            <ul className="space-y-1.5">
              {[
                'Prizes are credited to your internal balance when rounds are settled',
                'Withdraw to your wallet anytime — no lock-up periods',
                'Withdrawals are on-chain Solana transactions',
                'Small SOL gas fee required for withdrawal transaction',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                  <span style={{ color: '#7C3AED', flexShrink: 0 }}>◆</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
