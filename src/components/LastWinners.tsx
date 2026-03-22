import { motion } from 'framer-motion';
import { formatAddress, formatLamports, timeAgo } from '../utils/format';
import type { HistoricalRound } from '../hooks/useLotteryProgram';

interface LastWinnersProps {
  rounds: HistoricalRound[];
}

const TIER_CONFIG = {
  first: { emoji: '🥇', label: '1st', color: '#FFD700', bg: 'rgba(255,215,0,0.1)', border: 'rgba(255,215,0,0.2)' },
  second: { emoji: '🥈', label: '2nd', color: '#C0C0C0', bg: 'rgba(192,192,192,0.08)', border: 'rgba(192,192,192,0.2)' },
  third: { emoji: '🥉', label: '3rd', color: '#CD7F32', bg: 'rgba(205,127,50,0.08)', border: 'rgba(205,127,50,0.2)' },
};

export default function LastWinners({ rounds }: LastWinnersProps) {
  if (!rounds || rounds.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🏆</span>
        <h2 className="text-lg font-bold text-white">Recent Winners</h2>
        <span className="text-xs text-slate-500">Last {rounds.length} rounds</span>
      </div>

      <div className="space-y-3">
        {rounds.map((round, roundIdx) => (
          <motion.div
            key={round.roundNumber}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: roundIdx * 0.1 }}
            className="rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0d0d1a 0%, #0a0a15 100%)',
              border: '1px solid rgba(124, 58, 237, 0.15)',
            }}
          >
            {/* Round header */}
            <div
              className="px-4 py-2.5 flex items-center justify-between"
              style={{
                background: 'rgba(124, 58, 237, 0.1)',
                borderBottom: '1px solid rgba(124, 58, 237, 0.1)',
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-bold"
                  style={{ color: '#FFD700' }}
                >
                  Round #{round.roundNumber}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                  }}
                >
                  Settled
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  Pool: <span className="text-slate-300">{formatLamports(round.pool)} SOL</span>
                </span>
                {round.settledAt && (
                  <span className="text-xs text-slate-600">{timeAgo(round.settledAt)}</span>
                )}
              </div>
            </div>

            {/* Winners list */}
            <div className="p-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left text-xs text-slate-500 pb-2 font-medium w-12">Tier</th>
                      <th className="text-left text-xs text-slate-500 pb-2 font-medium">Address</th>
                      <th className="text-right text-xs text-slate-500 pb-2 font-medium">Prize</th>
                    </tr>
                  </thead>
                  <tbody>
                    {round.winners.map((winner, wIdx) => {
                      const config = TIER_CONFIG[winner.tier];
                      return (
                        <motion.tr
                          key={wIdx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: roundIdx * 0.1 + wIdx * 0.04 }}
                        >
                          <td className="py-1.5 pr-2">
                            <span
                              className="inline-flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded"
                              style={{
                                background: config.bg,
                                border: `1px solid ${config.border}`,
                                color: config.color,
                              }}
                            >
                              {config.emoji} {config.label}
                            </span>
                          </td>
                          <td className="py-1.5">
                            <span className="font-mono text-xs" style={{ color: '#94a3b8' }}>
                              {formatAddress(winner.address, 6)}
                            </span>
                          </td>
                          <td className="py-1.5 text-right">
                            <span className="text-xs font-semibold" style={{ color: '#10b981' }}>
                              +{formatLamports(winner.prize)} SOL
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
