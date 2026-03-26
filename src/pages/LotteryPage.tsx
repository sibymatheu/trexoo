import { useState } from "react";
import { TICKET_PRICE_SOL } from "../constants";
import { useLotteryProgram } from "../hooks/useLotteryProgram";
import { formatLamports } from "../utils/format";
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
  const [showPrizePopup, setShowPrizePopup] = useState(false);

  const handleBuyTicket = async (slotIndex: number) => {
    const success = await buyTicket(slotIndex);
    if (success) {
      setTxSuccess(true);
      setShowPrizePopup(true);
      setTimeout(() => setTxSuccess(false), 4000);
    }
  };

  const pool = currentRound.pool;
  const firstPrize = pool > 0n ? currentRound.firstPrize : pool * 20n / 100n;
  const secondPrize = pool > 0n ? currentRound.secondPrizeEach : pool * 15n / 100n;
  const thirdPrize = pool > 0n ? currentRound.thirdPrizeEach : pool * 125n / 1000n;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Prize popup modal */}
      {showPrizePopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowPrizePopup(false)}
        >
          <div
            className="relative max-w-sm w-full rounded-2xl p-6"
            style={{
              background: "linear-gradient(135deg, #0d0020 0%, #0a0a15 100%)",
              border: "1px solid rgba(124, 58, 237, 0.5)",
              boxShadow: "0 0 60px rgba(124, 58, 237, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPrizePopup(false)}
              className="absolute top-3 right-4 text-slate-500 hover:text-white text-xl"
            >
              ✕
            </button>
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🎰</div>
              <h2
                className="text-2xl font-black"
                style={{
                  background: "linear-gradient(135deg, #FFD700, #FFA500)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                You're in!
              </h2>
              <p className="text-slate-400 text-sm mt-1">Round #{currentRound.roundNumber}</p>
            </div>

            <div className="space-y-3 mb-5">
              <div
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🥇</span>
                  <div>
                    <div className="text-xs font-bold" style={{ color: "#FFD700" }}>1st Place</div>
                    <div className="text-xs text-slate-500">1 winner</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-white">
                  {pool > 0n ? `${formatLamports(firstPrize)} SOL` : "20% of pool"}
                </div>
              </div>

              <div
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "rgba(192,192,192,0.06)", border: "1px solid rgba(192,192,192,0.12)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🥈</span>
                  <div>
                    <div className="text-xs font-bold" style={{ color: "#C0C0C0" }}>2nd Place</div>
                    <div className="text-xs text-slate-500">2 winners</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-white">
                  {pool > 0n ? `${formatLamports(secondPrize)} SOL each` : "15% each"}
                </div>
              </div>

              <div
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "rgba(205,127,50,0.06)", border: "1px solid rgba(205,127,50,0.12)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🥉</span>
                  <div>
                    <div className="text-xs font-bold" style={{ color: "#CD7F32" }}>3rd Place</div>
                    <div className="text-xs text-slate-500">4 winners</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-white">
                  {pool > 0n ? `${formatLamports(thirdPrize)} SOL each` : "12.5% each"}
                </div>
              </div>
            </div>

            <div
              className="text-center py-2 rounded-lg text-xs text-slate-500"
              style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}
            >
              {currentRound.slots - currentRound.slotsFilled} slot{currentRound.slots - currentRound.slotsFilled !== 1 ? "s" : ""} remaining · Good luck! 🍀
            </div>
          </div>
        </div>
      )}

      {/* Hero section */}
      <div className="text-center mb-8">
        <h1
          className="anim-fade-down text-4xl sm:text-3xl font-bold mb-2"
          style={{
            fontFamily: "var(--font-family)",
            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B00 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 20px rgba(255, 215, 0, 0.4))",
            letterSpacing: "0.03em",
          }}
        >
          trexoo.fun
        </h1>
        <p className="anim-fade-in anim-delay-2 text-slate-400 text-base sm:text-sm">
          10 slots · 7 winners · {TICKET_PRICE_SOL} SOL per ticket · Provably fair
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div
          className="anim-fade-down mb-4 px-4 py-3 rounded-xl flex items-center justify-between"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#fca5a5",
          }}
        >
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 ml-3">✕</button>
        </div>
      )}

      {txSuccess && (
        <div
          className="anim-fade-down mb-4 px-4 py-3 rounded-xl"
          style={{
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#6ee7b7",
          }}
        >
          <span className="text-sm">🎉 Ticket purchased successfully! Good luck!</span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="spinner" />
          <span className="ml-3 text-slate-400">Loading...</span>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">
            <div className="anim-fade-up">
              <RoundTimer round={currentRound} />
            </div>

            {currentRound.status === "Settled" && currentRound.winningParticipants.length > 0 && (
              <div className="anim-fade-up">
                <WinnerAnimation round={currentRound} userWallet={walletPublicKey} />
              </div>
            )}

            <div
              className="anim-fade-up anim-delay-1 rounded-xl p-5"
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
            </div>

            {/* Prize distribution */}
            <div
              className="anim-fade-up anim-delay-2 rounded-xl p-5"
              style={{
                background: "linear-gradient(135deg, #0d0d1a 0%, #0a0a15 100%)",
                border: "1px solid rgba(124, 58, 237, 0.15)",
              }}
            >
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Prize Distribution
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg p-3 text-center" style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.15)" }}>
                  <div className="text-2xl mb-1">🥇</div>
                  <div className="text-xs font-bold" style={{ color: "#FFD700" }}>1st Place</div>
                  <div className="text-xs text-slate-400 mt-0.5">1 winner</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {pool > 0n ? `${formatLamports(firstPrize)} SOL` : "20%"}
                  </div>
                </div>
                <div className="rounded-lg p-3 text-center" style={{ background: "rgba(192,192,192,0.06)", border: "1px solid rgba(192,192,192,0.12)" }}>
                  <div className="text-2xl mb-1">🥈</div>
                  <div className="text-xs font-bold" style={{ color: "#C0C0C0" }}>2nd Place</div>
                  <div className="text-xs text-slate-400 mt-0.5">2 winners</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {pool > 0n ? `${formatLamports(secondPrize)} SOL` : "15% each"}
                  </div>
                </div>
                <div className="rounded-lg p-3 text-center" style={{ background: "rgba(205,127,50,0.06)", border: "1px solid rgba(205,127,50,0.12)" }}>
                  <div className="text-2xl mb-1">🥉</div>
                  <div className="text-xs font-bold" style={{ color: "#CD7F32" }}>3rd Place</div>
                  <div className="text-xs text-slate-400 mt-0.5">4 winners</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {pool > 0n ? `${formatLamports(thirdPrize)} SOL` : "12.5% each"}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-3 text-center">6% platform fee · 94% to winners</p>
            </div>
          </div>

          {/* Right column - sidebar */}
          <div className="space-y-5">
            <div className="anim-fade-left anim-delay-2">
              <LastWinners rounds={historicalRounds} />
            </div>
            <div className="anim-fade-left anim-delay-3">
              <ComingSoonGames />
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-xs text-slate-600">
          trexoo.fun runs on Solana Devnet · Program: Fzg95owE...svPhm ·{" "}
          <a href="/info" className="text-purple-500 hover:text-purple-400 underline underline-offset-2">
            Terms & Info
          </a>
        </p>
      </div>
    </div>
  );
}
