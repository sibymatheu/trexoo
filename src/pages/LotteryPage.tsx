import { useState } from "react";
import { TICKET_PRICE_SOL } from "../constants";
import { motion, AnimatePresence } from "framer-motion";
import { useLotteryProgram } from "../hooks/useLotteryProgram";
import RoundTimer from "../components/RoundTimer";
import SlotGrid from "../components/SlotGrid";
import WinnerAnimation from "../components/WinnerAnimation";
import LastWinners from "../components/LastWinners";
import ComingSoonGames from "../components/ComingSoonGames";

export default function LotteryPage() {
  const {
    currentRound,
    userTicket,
    historicalRounds,
    loading,
    txLoading,
    error,
    setError,
    buyTicket,
    isConnected,
    walletPublicKey,
  } = useLotteryProgram();

  const [txSuccess, setTxSuccess] = useState(false);

  const handleBuyTicket = async () => {
    const success = await buyTicket();
    if (success) {
      setTxSuccess(true);
      setTimeout(() => setTxSuccess(false), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero section */}
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-3xl font-bold mb-2"
          style={{
            fontFamily: "'Cinzel Decorative', Georgia, serif",
            background:
              "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B00 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 20px rgba(255, 215, 0, 0.4))",
            letterSpacing: "0.03em",
          }}
        >
          trexoo.fun
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-base sm:text-lg"
        >
          10 slots · 7 winners · {TICKET_PRICE_SOL} SOL per ticket · Provably
          fair
        </motion.p>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 px-4 py-3 rounded-xl flex items-center justify-between"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
            }}
          >
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-200 ml-3"
            >
              ✕
            </button>
          </motion.div>
        )}

        {txSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 px-4 py-3 rounded-xl"
            style={{
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#6ee7b7",
            }}
          >
            <span className="text-sm">
              🎉 Ticket purchased successfully! Good luck!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="spinner" />
          <span className="ml-3 text-slate-400">Loading...</span>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - main lottery */}
          <div className="lg:col-span-2 space-y-5">
            {/* Round timer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <RoundTimer round={currentRound} />
            </motion.div>

            {/* Winner Animation (when settled) */}
            {currentRound.status === "Settled" &&
              currentRound.winningParticipants.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <WinnerAnimation round={currentRound} />
                </motion.div>
              )}

            {/* Slot grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl p-5"
              style={{
                background: "linear-gradient(135deg, #0d0d1a 0%, #0a0a15 100%)",
                border: "1px solid rgba(124, 58, 237, 0.2)",
              }}
            >
              <SlotGrid
                round={currentRound}
                userWallet={walletPublicKey}
                userSlotIndex={userTicket?.slotIndex ?? null}
                onBuyTicket={handleBuyTicket}
                txLoading={txLoading}
                isConnected={isConnected}
              />
            </motion.div>

            {/* How the prizes break down */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-xl p-5"
              style={{
                background: "linear-gradient(135deg, #0d0d1a 0%, #0a0a15 100%)",
                border: "1px solid rgba(124, 58, 237, 0.15)",
              }}
            >
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Prize Distribution
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div
                  className="rounded-lg p-3 text-center"
                  style={{
                    background: "rgba(255,215,0,0.08)",
                    border: "1px solid rgba(255,215,0,0.15)",
                  }}
                >
                  <div className="text-2xl mb-1">🥇</div>
                  <div
                    className="text-xs font-bold"
                    style={{ color: "#FFD700" }}
                  >
                    1st Place
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">1 winner</div>
                  <div className="text-sm font-bold text-white mt-1">20%</div>
                </div>
                <div
                  className="rounded-lg p-3 text-center"
                  style={{
                    background: "rgba(192,192,192,0.06)",
                    border: "1px solid rgba(192,192,192,0.12)",
                  }}
                >
                  <div className="text-2xl mb-1">🥈</div>
                  <div
                    className="text-xs font-bold"
                    style={{ color: "#C0C0C0" }}
                  >
                    2nd Place
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">2 winners</div>
                  <div className="text-sm font-bold text-white mt-1">
                    15% each
                  </div>
                </div>
                <div
                  className="rounded-lg p-3 text-center"
                  style={{
                    background: "rgba(205,127,50,0.06)",
                    border: "1px solid rgba(205,127,50,0.12)",
                  }}
                >
                  <div className="text-2xl mb-1">🥉</div>
                  <div
                    className="text-xs font-bold"
                    style={{ color: "#CD7F32" }}
                  >
                    3rd Place
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">4 winners</div>
                  <div className="text-sm font-bold text-white mt-1">
                    12.5% each
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-3 text-center">
                6% platform fee · 94% to winners
              </p>
            </motion.div>
          </div>

          {/* Right column - sidebar */}
          <div className="space-y-5">
            {/* Last winners */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <LastWinners rounds={historicalRounds} />
            </motion.div>

            {/* Coming soon games */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ComingSoonGames />
            </motion.div>
          </div>
        </div>
      )}

      {/* Footer note */}
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-600">
          trexoo.fun runs on Solana Devnet · Program: A9C45R9B...79ra6D ·{" "}
          <a
            href="/info"
            className="text-purple-500 hover:text-purple-400 underline underline-offset-2"
          >
            Terms & Info
          </a>
        </p>
      </div>
    </div>
  );
}
