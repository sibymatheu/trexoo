import { motion } from 'framer-motion';

interface GameCard {
  name: string;
  icon: string;
  description: string;
  color: string;
  bgGradient: string;
  borderColor: string;
}

const GAMES: GameCard[] = [
  {
    name: 'Crash',
    icon: '🚀',
    description: 'Cash out before it crashes',
    color: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(185,28,28,0.05))',
    borderColor: 'rgba(239,68,68,0.25)',
  },
  {
    name: 'Dice',
    icon: '🎲',
    description: 'Roll the dice, pick your odds',
    color: '#3b82f6',
    bgGradient: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(29,78,216,0.05))',
    borderColor: 'rgba(59,130,246,0.25)',
  },
  {
    name: 'Roulette',
    icon: '🎡',
    description: 'Spin the wheel of fortune',
    color: '#10b981',
    bgGradient: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(4,120,87,0.05))',
    borderColor: 'rgba(16,185,129,0.25)',
  },
  {
    name: 'Blackjack',
    icon: '🃏',
    description: 'Beat the dealer to 21',
    color: '#FFD700',
    bgGradient: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(180,130,0,0.05))',
    borderColor: 'rgba(255,215,0,0.2)',
  },
  {
    name: 'Slots',
    icon: '🎰',
    description: 'Classic slot machine action',
    color: '#a855f7',
    bgGradient: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(107,33,168,0.05))',
    borderColor: 'rgba(168,85,247,0.25)',
  },
  {
    name: 'Poker',
    icon: '♠️',
    description: 'Texas Hold\'em on-chain',
    color: '#f97316',
    bgGradient: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(194,65,12,0.05))',
    borderColor: 'rgba(249,115,22,0.25)',
  },
];

export default function ComingSoonGames() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🎮</span> More Games
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">Expanding the casino — stay tuned</p>
        </div>
        <div
          className="text-xs px-3 py-1.5 rounded-full font-medium"
          style={{
            background: 'rgba(124, 58, 237, 0.15)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            color: '#a78bfa',
          }}
        >
          Coming Soon
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {GAMES.map((game, i) => (
          <motion.div
            key={game.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="relative rounded-xl p-4 cursor-pointer select-none"
            style={{
              background: game.bgGradient,
              border: `1px solid ${game.borderColor}`,
              transition: 'all 0.25s ease',
            }}
          >
            {/* Coming soon overlay badge */}
            <div
              className="absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded"
              style={{
                background: 'rgba(0,0,0,0.6)',
                color: '#94a3b8',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(4px)',
              }}
            >
              Soon
            </div>

            {/* Icon */}
            <motion.div
              className="text-3xl mb-2"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
            >
              {game.icon}
            </motion.div>

            {/* Name */}
            <div
              className="text-base font-bold mb-0.5"
              style={{ color: game.color }}
            >
              {game.name}
            </div>

            {/* Description */}
            <div className="text-xs text-slate-500 leading-tight">{game.description}</div>

            {/* Disabled overlay */}
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                background: 'rgba(3, 7, 18, 0.3)',
                backdropFilter: 'blur(0.5px)',
                cursor: 'not-allowed',
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Bottom teaser */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 text-center py-3 rounded-xl"
        style={{
          background: 'rgba(124, 58, 237, 0.05)',
          border: '1px dashed rgba(124, 58, 237, 0.2)',
        }}
      >
        <p className="text-slate-500 text-sm">
          🔔 <span className="text-slate-400">Follow us for launch announcements</span>
        </p>
      </motion.div>
    </div>
  );
}
