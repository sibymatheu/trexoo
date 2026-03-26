import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { formatAddress, formatLamports } from '../utils/format';
import type { RoundData } from '../hooks/useLotteryProgram';

interface WinnerAnimationProps {
  round: RoundData;
  userWallet?: string | null;
}

export default function WinnerAnimation({ round, userWallet }: WinnerAnimationProps) {
  const [phase, setPhase] = useState<'spinning' | 'revealing' | 'done'>('spinning');
  const [highlightedSlot, setHighlightedSlot] = useState<number>(-1);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  const isUserWinner = userWallet
    ? round.winningParticipants.includes(userWallet)
    : false;

  useEffect(() => {
    if (round.status !== 'Settled' || round.winningParticipants.length === 0) {
      setShowAnimation(false);
      return;
    }

    setShowAnimation(true);
    setPhase('spinning');
    setRevealedCount(0);
    setHighlightedSlot(-1);

    // Reel spinning phase - cycle through slots rapidly
    let spinCount = 0;
    const maxSpins = 30;
    const spinInterval = setInterval(() => {
      setHighlightedSlot(Math.floor(Math.random() * round.slots));
      spinCount++;
      if (spinCount >= maxSpins) {
        clearInterval(spinInterval);
        setPhase('revealing');
      }
    }, 80);

    return () => clearInterval(spinInterval);
  }, [round.status, round.winningParticipants.length, round.slots]);

  useEffect(() => {
    if (phase !== 'revealing') return;

    if (revealedCount >= round.winningParticipants.length) {
      setPhase('done');
      return;
    }

    const timer = setTimeout(() => {
      setRevealedCount(prev => prev + 1);
    }, 600);

    return () => clearTimeout(timer);
  }, [phase, revealedCount, round.winningParticipants.length]);

  if (!showAnimation) return null;

  const getWinnerTier = (index: number): { tier: 'first' | 'second' | 'third'; label: string; emoji: string; color: string; prize: bigint } => {
    if (index === round.firstWinnerIdx) {
      return { tier: 'first', label: '1st Place', emoji: '🥇', color: '#FFD700', prize: round.firstPrize };
    }
    if (index >= round.secondWinnersStartIdx && index < round.thirdWinnersStartIdx) {
      return { tier: 'second', label: '2nd Place', emoji: '🥈', color: '#C0C0C0', prize: round.secondPrizeEach };
    }
    return { tier: 'third', label: '3rd Place', emoji: '🥉', color: '#CD7F32', prize: round.thirdPrizeEach };
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0d0020 0%, #0a0015 100%)',
          border: '1px solid rgba(124, 58, 237, 0.4)',
          boxShadow: '0 0 40px rgba(124, 58, 237, 0.2)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(91,33,182,0.2))',
            borderBottom: '1px solid rgba(124, 58, 237, 0.2)',
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-3xl mb-1"
          >
            🎰
          </motion.div>
          <h2
            className="text-2xl font-black tracking-wide"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))',
            }}
          >
            {phase === 'spinning' ? 'Drawing Winners...' : phase === 'revealing' ? 'Revealing Winners!' : '🎊 Winners Announced!'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">Round #{round.roundNumber}</p>
        </div>

        <div className="p-6">
          {/* Slot machine reel - spinning phase */}
          {phase === 'spinning' && (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {Array.from({ length: round.slots }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: highlightedSlot === i ? 1.15 : 1,
                    borderColor: highlightedSlot === i ? '#FFD700' : 'rgba(124,58,237,0.3)',
                  }}
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{
                    background: highlightedSlot === i
                      ? 'linear-gradient(135deg, rgba(255,215,0,0.3), rgba(255,165,0,0.2))'
                      : 'rgba(124,58,237,0.1)',
                    border: `2px solid ${highlightedSlot === i ? '#FFD700' : 'rgba(124,58,237,0.3)'}`,
                    boxShadow: highlightedSlot === i ? '0 0 20px rgba(255,215,0,0.6)' : 'none',
                    color: highlightedSlot === i ? '#FFD700' : '#a78bfa',
                    transition: 'all 0.05s',
                  }}
                >
                  {i + 1}
                </motion.div>
              ))}
            </div>
          )}

          {/* Winners reveal */}
          {(phase === 'revealing' || phase === 'done') && (
            <div className="space-y-3">
              {round.winningParticipants.slice(0, revealedCount).map((winner, idx) => {
                const tierInfo = getWinnerTier(idx);
                return (
                  <motion.div
                    key={winner}
                    initial={{ opacity: 0, x: -30, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, rgba(${tierInfo.tier === 'first' ? '255,215,0' : tierInfo.tier === 'second' ? '192,192,192' : '205,127,50'},0.1), transparent)`,
                      border: `1px solid rgba(${tierInfo.tier === 'first' ? '255,215,0' : tierInfo.tier === 'second' ? '192,192,192' : '205,127,50'},0.25)`,
                    }}
                  >
                    <motion.span
                      className="text-2xl"
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      {tierInfo.emoji}
                    </motion.span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-xs font-bold uppercase tracking-wide"
                          style={{ color: tierInfo.color }}
                        >
                          {tierInfo.label}
                        </span>
                      </div>
                      <div
                        className="text-sm font-mono mt-0.5 truncate"
                        style={{ color: '#e2e8f0' }}
                      >
                        {formatAddress(winner, 8)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-sm font-bold"
                        style={{ color: '#10b981' }}
                      >
                        +{formatLamports(tierInfo.prize)} SOL
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {phase === 'revealing' && revealedCount < round.winningParticipants.length && (
                <div className="flex items-center justify-center py-3">
                  <div className="spinner" />
                  <span className="ml-2 text-sm text-slate-400">Revealing next winner...</span>
                </div>
              )}
            </div>
          )}

          {phase === 'done' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onAnimationComplete={() => {
                if (isUserWinner) {
                  confetti({ particleCount: 200, spread: 80, origin: { y: 0.5 }, colors: ['#FFD700', '#FFA500', '#7C3AED', '#10b981'] });
                } else {
                  confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
                }
              }}
            >
              {isUserWinner && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-3 py-3 rounded-xl text-center"
                  style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.4)' }}
                >
                  <p className="text-yellow-300 font-black text-lg">🏆 You won! Claim your prize below</p>
                </motion.div>
              )}
              <div
                className="mt-2 text-center py-3 rounded-xl"
                style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
              >
                <p className="text-emerald-400 text-sm font-medium">
                  Winners can claim prizes on the Withdraw page
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
