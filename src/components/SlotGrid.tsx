import { formatAddress } from '../utils/format';
import type { RoundData } from '../hooks/useLotteryProgram';
import { TICKET_PRICE_SOL } from '../constants';

interface SlotGridProps {
  round: RoundData;
  userWallet: string | null;
  userSlotIndex: number | null;
  onBuyTicket: (slotIndex: number) => void;
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
        <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-family)' }}>
          SLOTS <span className="text-slate-500 font-normal text-sm">{round.slotsFilled}/{round.slots}</span>
        </h2>
        {round.status === 'Open' && (
          <div className="text-xs text-slate-500">
            Ticket: <span className="text-yellow-400 font-medium">{TICKET_PRICE_SOL} SOL</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {slots.map(({ index, participant, isOccupied, isCurrentUser, isWinner, winnerTier }) => (
          <div
            key={index}
            className={`anim-fade-in relative rounded-none p-3 flex flex-col items-center justify-center min-h-[120px] transition-all duration-200 ${
              !isOccupied && canBuy ? 'cursor-pointer hover:scale-[1.03]' : 'cursor-default'
            } ${
              isCurrentUser ? 'slot-card-yours' :
              isOccupied ? 'slot-card-locked' :
              'slot-card-available'
            }`}
            onClick={() => {
              if (!isOccupied && canBuy && !txLoading) {
                onBuyTicket(index);
              }
            }}
          >
            {/* Top bar accent */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: isCurrentUser
                  ? 'linear-gradient(90deg, transparent, #FFD700, transparent)'
                  : isOccupied
                  ? 'linear-gradient(90deg, transparent, rgba(124,58,237,0.6), transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(56,189,248,0.6), transparent)',
              }}
            />

            {/* Slot number */}
            <div
              className="absolute top-2 left-2.5 text-xs font-bold tracking-widest"
              style={{
                fontFamily: 'var(--font-family)',
                color: isCurrentUser ? 'rgba(255,215,0,0.6)' : isOccupied ? 'rgba(124,58,237,0.5)' : 'rgba(56,189,248,0.5)',
              }}
            >
              {String(index + 1).padStart(2, '0')}
            </div>

            {/* Winner badge */}
            {isWinner && winnerTier && (
              <div className="absolute top-1.5 right-1.5">
                {winnerTier === 'first' && <span className="text-base">🥇</span>}
                {winnerTier === 'second' && <span className="text-base">🥈</span>}
                {winnerTier === 'third' && <span className="text-base">🥉</span>}
              </div>
            )}

            {/* YOU badge */}
            {isCurrentUser && !isWinner && (
              <div className="absolute top-2 right-2">
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 tracking-widest"
                  style={{
                    background: 'rgba(255,215,0,0.12)',
                    color: '#FFD700',
                    border: '1px solid rgba(255,215,0,0.3)',
                    fontFamily: 'var(--font-family)',
                    clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
                  }}
                >
                  YOU
                </span>
              </div>
            )}

            {isOccupied ? (
              <div className="flex flex-col items-center gap-1.5 mt-3">
                {/* Avatar hex */}
                <div
                  className="w-9 h-9 flex items-center justify-center text-base"
                  style={{
                    background: isCurrentUser
                      ? 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,140,0,0.08))'
                      : 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(91,33,182,0.08))',
                    border: `1px solid ${isCurrentUser ? 'rgba(255,215,0,0.3)' : 'rgba(124,58,237,0.25)'}`,
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  }}
                >
                  {isCurrentUser ? '★' : '◈'}
                </div>
                <div
                  className="text-[10px] font-medium tracking-wider"
                  style={{
                    color: isCurrentUser ? '#FFD700' : '#7c6fa0',
                    fontFamily: 'var(--font-family)',
                  }}
                >
                  {formatAddress(participant || '', 4)}
                </div>
                {isWinner && winnerTier && (
                  <div
                    className="text-[9px] font-bold tracking-widest px-2 py-0.5"
                    style={{
                      color: '#38bdf8',
                      background: 'rgba(56,189,248,0.1)',
                      border: '1px solid rgba(56,189,248,0.3)',
                      fontFamily: 'var(--font-family)',
                    }}
                  >
                    WINNER
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 mt-3">
                {canBuy && !txLoading ? (
                  <>
                    <div
                      className="anim-scale-pulse w-9 h-9 flex items-center justify-center text-lg"
                      style={{
                        background: 'rgba(56,189,248,0.1)',
                        border: '1px solid rgba(56,189,248,0.35)',
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                        color: '#38bdf8',
                      }}
                    >
                      +
                    </div>
                    <div
                      className="text-[10px] font-bold tracking-widest"
                      style={{ color: '#38bdf8', fontFamily: 'var(--font-family)' }}
                    >
                      OPEN
                    </div>
                  </>
                ) : txLoading && !isOccupied ? (
                  <>
                    <div className="spinner mb-1" />
                    <div className="text-[10px] text-slate-500" style={{ fontFamily: 'var(--font-family)' }}>
                      PROCESSING
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="w-9 h-9 flex items-center justify-center text-base"
                      style={{
                        background: 'rgba(56,189,248,0.05)',
                        border: '1px solid rgba(56,189,248,0.15)',
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                        color: 'rgba(56,189,248,0.4)',
                      }}
                    >
                      ○
                    </div>
                    <div
                      className="text-[10px] font-medium tracking-widest"
                      style={{ color: 'rgba(56,189,248,0.4)', fontFamily: 'var(--font-family)' }}
                    >
                      OPEN
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Bottom bar accent */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[1px]"
              style={{
                background: isCurrentUser
                  ? 'linear-gradient(90deg, transparent, rgba(255,215,0,0.2), transparent)'
                  : isOccupied
                  ? 'linear-gradient(90deg, transparent, rgba(124,58,237,0.2), transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(56,189,248,0.2), transparent)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Hint bar */}
      {canBuy && (
        <div
          className="anim-fade-up w-full mt-4 py-3 px-6 text-center text-xs tracking-widest"
          style={{
            background: 'rgba(56, 189, 248, 0.04)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderLeft: '3px solid rgba(56,189,248,0.5)',
            color: '#7dd3fc',
            fontFamily: 'var(--font-family)',
          }}
        >
          {txLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              PROCESSING TRANSACTION...
            </span>
          ) : (
            `SELECT A SLOT TO ENTER — ${TICKET_PRICE_SOL} SOL`
          )}
        </div>
      )}

      {!isConnected && (
        <div
          className="w-full mt-4 py-3 px-6 text-center text-xs tracking-widest"
          style={{
            background: 'rgba(124, 58, 237, 0.06)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            borderLeft: '3px solid rgba(124,58,237,0.5)',
            color: '#a78bfa',
            fontFamily: 'var(--font-family)',
          }}
        >
          CONNECT WALLET TO PARTICIPATE
        </div>
      )}

      {isConnected && userAlreadyIn && round.status === 'Open' && (
        <div
          className="w-full mt-4 py-3 px-6 text-center text-xs tracking-widest"
          style={{
            background: 'rgba(255, 215, 0, 0.06)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            borderLeft: '3px solid rgba(255,215,0,0.5)',
            color: '#FFD700',
            fontFamily: 'var(--font-family)',
          }}
        >
          ✓ YOU ARE IN THIS ROUND — SLOT #{(userSlotIndex ?? 0) + 1}
        </div>
      )}

      {round.status === 'Full' && (
        <div
          className="w-full mt-4 py-3 px-6 text-center text-xs font-bold tracking-widest"
          style={{
            background: 'rgba(245, 158, 11, 0.06)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderLeft: '3px solid rgba(245,158,11,0.6)',
            color: '#f59e0b',
            fontFamily: 'var(--font-family)',
          }}
        >
          ◈ ROUND FULL — DRAWING WINNERS SOON
        </div>
      )}

      {round.status === 'Settled' && (
        <div
          className="w-full mt-4 py-3 px-6 text-center text-xs font-bold tracking-widest"
          style={{
            background: 'rgba(124, 58, 237, 0.06)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            borderLeft: '3px solid rgba(124,58,237,0.6)',
            color: '#a78bfa',
            fontFamily: 'var(--font-family)',
          }}
        >
          ✨ ROUND SETTLED — WINNERS DRAWN
        </div>
      )}
    </div>
  );
}
