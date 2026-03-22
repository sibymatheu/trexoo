import { motion } from 'framer-motion';
import { formatAddress } from '../utils/format';
import type { RoundData } from '../hooks/useLotteryProgram';
import { TICKET_PRICE_SOL } from '../constants';

interface SlotGridProps {
  round: RoundData;
  userWallet: string | null;
  userSlotIndex: number | null;
  onBuyTicket: () => void;
  txLoading: boolean;
  isConnected: boolean;
}

export default function SlotGrid({
  round,
  userWallet,
  userSlotIndex,
  onBuyTicket,
  txLoading,
  isConnected,
}: SlotGridProps) {
  const slots = Array.from({ length: round.slots }, (_, i) => {
    const participant = round.participants[i];
    const isOccupied = !!participant;
    const isCurrentUser = isOccupied && participant === userWallet;
    const isWinner = round.status === 'Settled' && round.winningParticipants.includes(participant || '');

    let winnerTier: 'first' | 'second' | 'third' | null = null;
    if (isWinner && round.status === 'Settled') {
      const winnerIdx = round.winningParticipants.indexOf(participant || '');
      if (winnerIdx === round.firstWinnerIdx) winnerTier = 'first';
      else if (winnerIdx >= round.secondWinnersStartIdx && winnerIdx < round.thirdWinnersStartIdx) winnerTier = 'second';
      else winnerTier = 'third';
    }

    return { index: i, participant, isOccupied, isCurrentUser, isWinner, winnerTier };
  });

  const userAlreadyIn = userSlotIndex !== null && userSlotIndex >= 0;
  const canBuy = isConnected && !userAlreadyIn && round.status === 'Open' && round.slotsFilled < round.slots;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">
          Slots <span className="text-slate-400 font-normal text-sm">({round.slotsFilled}/{round.slots} filled)</span>
        </h2>
        {round.status === 'Open' && (
          <div className="text-xs text-slate-500">
            Ticket: <span className="text-yellow-400 font-medium">{TICKET_PRICE_SOL} SOL</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {slots.map(({ index, participant, isOccupied, isCurrentUser, isWinner, winnerTier }) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={!isOccupied && canBuy ? { scale: 1.04, y: -2 } : {}}
            className={`relative rounded-xl p-3 flex flex-col items-center justify-center min-h-[110px] cursor-${!isOccupied && canBuy ? 'pointer' : 'default'} transition-all duration-200 ${
              isCurrentUser ? 'slot-card-yours' :
              isOccupied ? 'slot-card-locked' :
              'slot-card-available'
            }`}
            onClick={() => {
              if (!isOccupied && canBuy && !txLoading) {
                onBuyTicket();
              }
            }}
          >
            {/* Slot number */}
            <div
              className="absolute top-2 left-2.5 text-xs font-bold"
              style={{ color: isCurrentUser ? '#FFD700' : isOccupied ? '#7C3AED' : '#10b981' }}
            >
              #{index + 1}
            </div>

            {/* Winner badge */}
            {isWinner && winnerTier && (
              <div className="absolute top-1.5 right-1.5">
                {winnerTier === 'first' && <span className="text-lg">🥇</span>}
                {winnerTier === 'second' && <span className="text-lg">🥈</span>}
                {winnerTier === 'third' && <span className="text-lg">🥉</span>}
              </div>
            )}

            {/* You badge */}
            {isCurrentUser && (
              <div className="absolute top-1.5 right-1.5">
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(255, 215, 0, 0.2)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)' }}
                >
                  YOU
                </span>
              </div>
            )}

            {isOccupied ? (
              <>
                {/* Occupied slot */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2"
                  style={{
                    background: isCurrentUser
                      ? 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,165,0,0.1))'
                      : 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(91,33,182,0.1))',
                    border: `1px solid ${isCurrentUser ? 'rgba(255,215,0,0.4)' : 'rgba(124,58,237,0.3)'}`,
                  }}
                >
                  {isCurrentUser ? '👤' : '🔒'}
                </div>
                <div
                  className="text-xs font-medium text-center leading-tight"
                  style={{ color: isCurrentUser ? '#FFD700' : '#a78bfa' }}
                >
                  {formatAddress(participant || '', 4)}
                </div>
                {isWinner && winnerTier && (
                  <div className="mt-1 text-xs font-bold" style={{ color: '#10b981' }}>
                    Winner!
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Available slot */}
                {canBuy && !txLoading ? (
                  <>
                    <motion.div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2"
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                      }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ➕
                    </motion.div>
                    <div className="text-xs font-semibold" style={{ color: '#10b981' }}>
                      Available
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">Click to join</div>
                  </>
                ) : txLoading && !isOccupied ? (
                  <>
                    <div className="spinner mb-2" />
                    <div className="text-xs text-slate-400">Processing...</div>
                  </>
                ) : (
                  <>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2"
                      style={{
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                      }}
                    >
                      ⭕
                    </div>
                    <div className="text-xs font-medium" style={{ color: '#10b981' }}>
                      Open
                    </div>
                  </>
                )}
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Buy ticket CTA */}
      {canBuy && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onBuyTicket}
          disabled={txLoading}
          className="w-full mt-4 py-3.5 px-6 rounded-xl font-bold text-base transition-all"
          style={{
            background: txLoading
              ? 'rgba(124, 58, 237, 0.3)'
              : 'linear-gradient(135deg, #7C3AED 0%, #5b21b6 100%)',
            color: 'white',
            border: '1px solid rgba(124, 58, 237, 0.4)',
            boxShadow: txLoading ? 'none' : '0 0 20px rgba(124, 58, 237, 0.4)',
            cursor: txLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {txLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              Processing Transaction...
            </span>
          ) : (
            `🎰 Buy Ticket — ${TICKET_PRICE_SOL} SOL`
          )}
        </motion.button>
      )}

      {!isConnected && (
        <div
          className="w-full mt-4 py-3 px-6 rounded-xl text-center text-sm"
          style={{
            background: 'rgba(124, 58, 237, 0.08)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            color: '#a78bfa',
          }}
        >
          Connect your wallet to participate
        </div>
      )}

      {isConnected && userAlreadyIn && round.status === 'Open' && (
        <div
          className="w-full mt-4 py-3 px-6 rounded-xl text-center text-sm"
          style={{
            background: 'rgba(255, 215, 0, 0.08)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            color: '#FFD700',
          }}
        >
          ✓ You are in this round! (Slot #{(userSlotIndex ?? 0) + 1})
        </div>
      )}

      {round.status === 'Full' && (
        <div
          className="w-full mt-4 py-3 px-6 rounded-xl text-center text-sm font-semibold"
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#f59e0b',
          }}
        >
          🔥 Round is full — Drawing winners soon!
        </div>
      )}

      {round.status === 'Settled' && (
        <div
          className="w-full mt-4 py-3 px-6 rounded-xl text-center text-sm font-semibold"
          style={{
            background: 'rgba(124, 58, 237, 0.1)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            color: '#a78bfa',
          }}
        >
          ✨ Round settled — Winners have been drawn!
        </div>
      )}
    </div>
  );
}
