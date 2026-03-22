import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import LotteryPage from "./pages/LotteryPage";
import WithdrawPage from "./pages/WithdrawPage";
import InfoPage from "./pages/InfoPage";

function App() {
  return (
    <BrowserRouter>
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "var(--casino-bg)" }}
      >
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LotteryPage />} />
            <Route path="/withdraw" element={<WithdrawPage />} />
            <Route path="/info" element={<InfoPage />} />
          </Routes>
        </main>
        <footer
          className="py-4 text-center text-xs text-slate-600"
          style={{
            borderTop: "1px solid rgba(124, 58, 237, 0.1)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4">
            <span>trexoo.fun © 2026 · Built on Solana · </span>
            <a href="/info" className="text-purple-600 hover:text-purple-400">
              Terms
            </a>
            <span> · </span>
            <a href="/info" className="text-purple-600 hover:text-purple-400">
              Privacy
            </a>
            <span> · Devnet only</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
