import { useState } from 'react';
import { TICKET_PRICE_SOL } from '../constants';

type Tab = 'how' | 'terms' | 'privacy';

const TAB_CONFIG: { id: Tab; label: string; icon: string }[] = [
  { id: 'how', label: 'How It Works', icon: '🎯' },
  { id: 'terms', label: 'Terms & Conditions', icon: '📋' },
  { id: 'privacy', label: 'Privacy Policy', icon: '🔒' },
];

export default function InfoPage() {
  const [activeTab, setActiveTab] = useState<Tab>('how');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="anim-fade-down text-center mb-8">
        <h1
          className="text-3xl font-black mb-2"
          style={{
            fontFamily: "var(--font-family)",
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Information
        </h1>
        <p className="text-slate-400 text-sm">Everything you need to know about trexoo.fun</p>
      </div>

      {/* Tab navigation */}
      <div
        className="flex rounded-xl p-1 mb-6"
        style={{
          background: 'rgba(124, 58, 237, 0.1)',
          border: '1px solid rgba(124, 58, 237, 0.2)',
        }}
      >
        {TAB_CONFIG.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200"
            style={
              activeTab === tab.id
                ? {
                    background: 'linear-gradient(135deg, #7C3AED, #5b21b6)',
                    color: 'white',
                    boxShadow: '0 0 15px rgba(124, 58, 237, 0.4)',
                  }
                : {
                    color: '#64748b',
                  }
            }
          >
            <span className="hidden sm:inline">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        key={activeTab}
        className="anim-fade-up rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, #0d0d1a 0%, #0a0a15 100%)',
          border: '1px solid rgba(124, 58, 237, 0.15)',
        }}
      >
        {activeTab === 'how' && <HowItWorks />}
        {activeTab === 'terms' && <Terms />}
        {activeTab === 'privacy' && <Privacy />}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2
        className="text-base font-bold mb-3 flex items-center gap-2"
        style={{ color: '#FFD700' }}
      >
        {title}
      </h2>
      <div className="text-sm text-slate-400 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 mt-0.5"
        style={{
          background: 'linear-gradient(135deg, #7C3AED, #5b21b6)',
          color: 'white',
          boxShadow: '0 0 10px rgba(124, 58, 237, 0.4)',
        }}
      >
        {number}
      </div>
      <div>
        <div className="text-sm font-semibold text-white mb-0.5">{title}</div>
        <div className="text-sm text-slate-400">{description}</div>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🎰</span>
        <div>
          <h2 className="text-xl font-bold text-white">How It Works</h2>
          <p className="text-xs text-slate-500">Simple, transparent, provably fair</p>
        </div>
      </div>

      <Section title="The Rounds">
        <p>
          trexoo.fun runs on Solana's devnet. Each round has exactly <strong className="text-white">10 slots</strong> available.
          Players buy tickets to fill those slots. Once all 10 slots are filled, the smart contract
          automatically draws <strong className="text-white">7 winners</strong> from the participants.
        </p>
        <p>
          Every wallet address can only buy <strong className="text-white">one ticket per round</strong> —
          keeping it fair for everyone.
        </p>
      </Section>

      <div className="space-y-4 mb-6">
        <h2 className="text-base font-bold" style={{ color: '#FFD700' }}>Step by Step</h2>
        <Step number={1} title="Connect Wallet" description="Connect your Phantom wallet to participate. Make sure you're on Solana devnet." />
        <Step number={2} title="Buy a Ticket" description={`Click any available slot to buy your ticket for ${TICKET_PRICE_SOL} SOL. Each wallet can only hold one slot per round.`} />
        <Step number={3} title="Wait for the Round to Fill" description="Once all 10 slots are occupied, the round is marked as Full and the draw begins." />
        <Step number={4} title="Winners Drawn" description="The backend calls draw_winners on-chain using slot hash randomness. 7 of the 10 participants win prizes." />
        <Step number={5} title="Claim Your Prizes" description="Winnings are credited to your internal balance. Visit the Withdraw page to send them to your wallet." />
      </div>

      <Section title="Prize Tiers">
        <div className="space-y-2">
          <div
            className="flex justify-between items-center px-3 py-2 rounded-lg"
            style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.15)' }}
          >
            <span>🥇 <strong className="text-white">1st Place</strong> — 1 winner</span>
            <span className="font-bold" style={{ color: '#FFD700' }}>20% of pool</span>
          </div>
          <div
            className="flex justify-between items-center px-3 py-2 rounded-lg"
            style={{ background: 'rgba(192,192,192,0.06)', border: '1px solid rgba(192,192,192,0.12)' }}
          >
            <span>🥈 <strong className="text-white">2nd Place</strong> — 2 winners</span>
            <span className="font-bold" style={{ color: '#C0C0C0' }}>15% each (30% total)</span>
          </div>
          <div
            className="flex justify-between items-center px-3 py-2 rounded-lg"
            style={{ background: 'rgba(205,127,50,0.06)', border: '1px solid rgba(205,127,50,0.12)' }}
          >
            <span>🥉 <strong className="text-white">3rd Place</strong> — 4 winners</span>
            <span className="font-bold" style={{ color: '#CD7F32' }}>12.5% each (50% total)</span>
          </div>
          <div
            className="flex justify-between items-center px-3 py-2 rounded-lg"
            style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)' }}
          >
            <span className="text-slate-400">Platform fee</span>
            <span className="text-purple-400">6% of pool</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          With 10 tickets at {TICKET_PRICE_SOL} SOL each = {(10 * TICKET_PRICE_SOL).toFixed(2)} SOL pool:
          1st wins ~{(10 * TICKET_PRICE_SOL * 0.94 * 0.20).toFixed(4)} SOL · 2nd wins ~{(10 * TICKET_PRICE_SOL * 0.94 * 0.15).toFixed(4)} SOL each · 3rd wins ~{(10 * TICKET_PRICE_SOL * 0.94 * 0.125).toFixed(4)} SOL each
        </p>
      </Section>

      <Section title="Randomness & Fairness">
        <p>
          Winners are drawn using Solana's <strong className="text-white">slot hash</strong> as a
          randomness source — this is verifiable on-chain and cannot be manipulated by the house.
          The smart contract code is open source and auditable by anyone.
        </p>
      </Section>

      <Section title="Program Address">
        <div
          className="font-mono text-xs px-3 py-2 rounded-lg break-all"
          style={{ background: 'rgba(124,58,237,0.1)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}
        >
          A9C45R9BG3UAsa5SdKXPTzAZad3ZKt5Yt1NEwn79ra6D
        </div>
        <p className="text-xs text-slate-500 mt-1">Deployed on Solana Devnet</p>
      </Section>
    </div>
  );
}

function Terms() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">📋</span>
        <div>
          <h2 className="text-xl font-bold text-white">Terms & Conditions</h2>
          <p className="text-xs text-slate-500">Last updated: March 2026</p>
        </div>
      </div>

      <div className="space-y-5 text-sm text-slate-400 leading-relaxed">
        <Section title="1. Acceptance of Terms">
          <p>
            By accessing and using trexoo.fun ("the Platform"), you accept and agree to be bound
            by these Terms and Conditions. If you do not agree, you must not use the Platform.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p>You must be of legal age in your jurisdiction to participate in gambling activities.
          By using trexoo.fun you confirm that gambling is legal in your jurisdiction and that you
          are of legal age. The Platform operates on Solana's devnet and is currently for
          demonstration and testing purposes.</p>
        </Section>

        <Section title="3. How It Works">
          <p>
            trexoo.fun is a decentralized game running on the Solana blockchain. All game
            mechanics are controlled by an immutable smart contract. The Platform interface merely
            provides a frontend to interact with the on-chain program. Prize distribution, winner
            selection, and fund custody are all managed by the smart contract.
          </p>
        </Section>

        <Section title="4. No Guarantees of Winning">
          <p>
            Participation does not guarantee any return on your investment. The outcome is
            determined by blockchain randomness and is not influenced by the Platform operator.
            Past results do not predict future outcomes.
          </p>
        </Section>

        <Section title="5. Fees">
          <p>
            A 6% platform fee is deducted from each round's pool before prize distribution.
            This fee is hard-coded in the smart contract and is used to fund platform operations.
            Additionally, Solana network fees (gas) apply to all on-chain transactions.
          </p>
        </Section>

        <Section title="6. Responsible Gambling">
          <p>
            We encourage responsible gambling. Only gamble with funds you can afford to lose.
            If you believe you have a gambling problem, please seek professional help. The Platform
            does not offer credit and does not accept deposits beyond ticket purchases.
          </p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, trexoo.fun and its operators shall not be liable
            for any losses, damages, or claims arising from your use of the Platform, including but
            not limited to lost funds, missed transactions, or smart contract bugs.
          </p>
        </Section>

        <Section title="8. Changes to Terms">
          <p>
            We reserve the right to update these Terms at any time. Continued use of the Platform
            after changes constitutes acceptance of the new Terms.
          </p>
        </Section>

        <div
          className="mt-4 p-3 rounded-xl text-xs"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
          }}
        >
          ⚠️ This platform is running on Solana devnet for testing purposes only. Do not use real
          mainnet funds.
        </div>
      </div>
    </div>
  );
}

function Privacy() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🔒</span>
        <div>
          <h2 className="text-xl font-bold text-white">Privacy Policy</h2>
          <p className="text-xs text-slate-500">Last updated: March 2026</p>
        </div>
      </div>

      <div className="space-y-5 text-sm text-slate-400 leading-relaxed">
        <Section title="1. Information We Collect">
          <p>
            trexoo.fun is a <strong className="text-white">decentralized application</strong>. We do
            not collect personally identifiable information (PII) such as names, emails, or
            physical addresses.
          </p>
          <p>
            The only "data" associated with your activity is your Solana wallet public key, which
            is publicly visible on the blockchain by design.
          </p>
        </Section>

        <Section title="2. On-Chain Data">
          <p>
            All on-chain interactions — ticket purchases, round participation, prize claims, and
            withdrawals — are recorded on the Solana blockchain. This data is public and permanent.
            Anyone can inspect these transactions using a Solana block explorer.
          </p>
        </Section>

        <Section title="3. Local Storage">
          <p>
            The Platform may store minimal data in your browser's local storage to improve user
            experience (e.g., remembering your preferred wallet). This data never leaves your
            device and is not sent to our servers.
          </p>
        </Section>

        <Section title="4. Third-Party Services">
          <p>
            We use Solana RPC endpoints to communicate with the blockchain. These providers may
            log your IP address and request metadata per their own privacy policies. We use
            publicly available devnet RPC endpoints.
          </p>
        </Section>

        <Section title="5. Wallet Connections">
          <p>
            When you connect a wallet (e.g., Phantom), you authorize the Platform to read your
            public key and request transaction signatures. We never request access to your
            private key. Wallet connection is handled by your wallet provider's software.
          </p>
        </Section>

        <Section title="6. Analytics">
          <p>
            We may collect anonymized analytics data (page views, interaction patterns) to improve
            the Platform. This data is aggregated and cannot be used to identify individual users.
          </p>
        </Section>

        <Section title="7. Data Retention">
          <p>
            Since we store minimal off-chain data, there is little to retain or delete. Blockchain
            data is permanent by nature. To "remove" yourself from the Platform, simply stop using
            it — no account deletion is necessary.
          </p>
        </Section>

        <Section title="8. Contact">
          <p>
            If you have privacy-related questions or concerns, please reach out through our
            official community channels. We are committed to transparency and will respond
            promptly.
          </p>
        </Section>

        <div
          className="p-3 rounded-xl text-xs"
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            color: '#6ee7b7',
          }}
        >
          ✅ trexoo.fun is privacy-friendly by design. We collect minimal data and put you in control
          of your on-chain interactions.
        </div>
      </div>
    </div>
  );
}
