import { useState, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Link, useLocation } from "react-router-dom";
import { useLotteryProgram } from "../hooks/useLotteryProgram";
import { formatLamports, formatAsUSDC } from "../utils/format";

export default function Header() {
  const location = useLocation();
  const { connected, disconnect, publicKey, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const { solBalance, userBalance } = useLotteryProgram();

  const [popupOpen, setPopupOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const fullAddress = publicKey?.toBase58() ?? "";
  const truncated = fullAddress
    ? `${fullAddress.slice(0, 4)}...${fullAddress.slice(-4)}`
    : "";

  // Close popup on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopupOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleCopy() {
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDisconnect() {
    disconnect();
    setPopupOpen(false);
  }

  const navLinks = [
    { path: "/", label: "PLAY" },
    { path: "/withdraw", label: "WITHDRAW" },
    { path: "/info", label: "INFO" },
  ];

  return (
    <header
      style={{
        background: "rgba(3, 7, 18, 0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
      className="sticky top-0 z-50 pt-3"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #1a003a, #0d0020)",
                border: "1px solid rgba(255, 200, 0, 0.3)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 2L4.5 13.5H11.5L11 22L19.5 10.5H12.5L13 2Z"
                  fill="#0a0015"
                  stroke="#0a0015"
                  strokeWidth="0.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M13 2L4.5 13.5H11.5L11 22L19.5 10.5H12.5L13 2Z"
                  fill="url(#bolt)"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient
                    id="bolt"
                    x1="12"
                    y1="2"
                    x2="12"
                    y2="22"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FFF176" />
                    <stop offset="1" stopColor="#FF6F00" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <span
                className="text-2xl font-bold tracking-wide"
                style={{
                  fontFamily: "var(--font-family)",
                  background: "linear-gradient(135deg, #FFD700, #FFA500)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "none",
                  filter: "drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))",
                  letterSpacing: "0.02em",
                }}
              >
                trexoo.fun
              </span>
              <div className="text-xs text-purple-400 leading-none -mt-0.5">
                Built on Solana
              </div>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? "bg-purple-900/50 text-yellow-400"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                style={
                  location.pathname === link.path
                    ? { boxShadow: "0 0 10px rgba(124, 58, 237, 0.3)", fontFamily: "var(--font-family)" }
                    : { fontFamily: "var(--font-family)" }
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side: balances + wallet */}
          <div className="flex items-center gap-3">
            {connected && (
              <>
                {/* SOL Balance */}
                <div
                  className="hidden sm:flex flex-col items-end px-4 py-1 rounded-full"
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                  }}
                >
                  <span className="text-xs text-slate-400 leading-none">
                    Wallet
                  </span>
                  <span className="text-sm font-semibold text-emerald-400 leading-tight">
                    {formatLamports(solBalance)} SOL
                  </span>
                </div>

                {/* Winnings Balance */}
                <div
                  className="hidden sm:flex flex-col items-end px-4 py-1 rounded-full"
                  style={{
                    background: "rgba(255, 215, 0, 0.08)",
                    border: "1px solid rgba(255, 215, 0, 0.2)",
                  }}
                >
                  <span className="text-xs text-slate-400 leading-none">
                    Winnings
                  </span>
                  <span
                    className="text-sm font-semibold leading-tight"
                    style={{ color: "#FFD700" }}
                  >
                    {formatAsUSDC(userBalance.balance)} SOL
                  </span>
                </div>
              </>
            )}

            {/* Wallet Button */}
            {connected ? (
              <div className="relative" ref={popupRef}>
                {/* Trigger button */}
                <button
                  onClick={() => setPopupOpen((o) => !o)}
                  className="flex items-center gap-2 px-3 py-1 rounded-full transition-all"
                  style={{
                    background: popupOpen
                      ? "rgba(124, 58, 237, 0.2)"
                      : "rgba(124, 58, 237, 0.1)",
                    border: "1px solid rgba(124, 58, 237, 0.35)",
                  }}
                >
                  {/* Wallet icon */}
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                    style={{ background: "rgba(124, 58, 237, 0.4)" }}
                  >
                    ◈
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-slate-400 leading-none">
                      {wallet?.adapter.name ?? "Wallet"}
                    </span>
                    <span className="text-sm font-semibold text-purple-300 leading-tight font-mono">
                      {truncated}
                    </span>
                  </div>
                  {/* Chevron */}
                  <svg
                    className="w-3 h-3 text-slate-400 transition-transform"
                    style={{
                      transform: popupOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown popup */}
                {popupOpen && (
                  <div
                    className="absolute right-0 mt-2 w-72 rounded-xl overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, #0d0d1a 0%, #0a0a15 100%)",
                      border: "1px solid rgba(124, 58, 237, 0.3)",
                      boxShadow:
                        "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(124,58,237,0.15)",
                    }}
                  >
                    {/* Header row */}
                    <div
                      className="px-4 py-3 flex items-center gap-2"
                      style={{
                        borderBottom: "1px solid rgba(124, 58, 237, 0.15)",
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                        style={{ background: "rgba(124, 58, 237, 0.3)" }}
                      >
                        ◈
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">
                          {wallet?.adapter.name ?? "Wallet"}
                        </div>
                        <div className="text-xs font-semibold text-purple-300">
                          Connected
                        </div>
                      </div>
                    </div>

                    {/* Address row */}
                    <div
                      className="px-4 py-3"
                      style={{
                        borderBottom: "1px solid rgba(124, 58, 237, 0.15)",
                      }}
                    >
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">
                        Wallet Address
                      </div>
                      <div
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg"
                        style={{
                          background: "rgba(124, 58, 237, 0.08)",
                          border: "1px solid rgba(124, 58, 237, 0.15)",
                        }}
                      >
                        <span className="text-xs text-slate-300 font-mono truncate">
                          {fullAddress}
                        </span>
                        <button
                          onClick={handleCopy}
                          className="shrink-0 flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all"
                          style={{
                            background: copied
                              ? "rgba(16,185,129,0.15)"
                              : "rgba(124,58,237,0.15)",
                            color: copied ? "#6ee7b7" : "#a78bfa",
                            border: copied
                              ? "1px solid rgba(16,185,129,0.3)"
                              : "1px solid rgba(124,58,237,0.3)",
                          }}
                        >
                          {copied ? (
                            <>✓ Copied</>
                          ) : (
                            <>
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Disconnect button */}
                    <div className="px-4 py-3">
                      <button
                        onClick={handleDisconnect}
                        className="w-full py-2 rounded-lg text-sm font-semibold transition-all"
                        style={{
                          background: "rgba(239, 68, 68, 0.08)",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                          color: "#fca5a5",
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "rgba(239,68,68,0.15)";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "rgba(239,68,68,0.08)";
                        }}
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setVisible(true)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                  border: "1px solid rgba(124, 58, 237, 0.5)",
                  color: "#fff",
                  boxShadow: "0 0 15px rgba(124, 58, 237, 0.3)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 20px rgba(124, 58, 237, 0.5)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 15px rgba(124, 58, 237, 0.3)";
                }}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-1 pb-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex-1 text-center px-2 py-1.5 rounded text-xs font-medium transition-all ${
                location.pathname === link.path
                  ? "bg-purple-900/50 text-yellow-400"
                  : "text-slate-400 hover:text-white"
              }`}
              style={{ fontFamily: "var(--font-family)" }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
