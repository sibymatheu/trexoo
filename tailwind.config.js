/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#FFD700',
          light: '#FFE44D',
          dark: '#CC9900',
        },
        casino: {
          bg: '#030712',
          card: '#0f0f1a',
          border: '#1a1a2e',
          purple: '#7C3AED',
          purpleLight: '#9F67FF',
        },
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 5px #FFD700, 0 0 10px #FFD700' },
          '50%': { boxShadow: '0 0 20px #FFD700, 0 0 40px #FFD700, 0 0 60px #FFD700' },
        },
        glow: {
          '0%, 100%': { textShadow: '0 0 5px #FFD700' },
          '50%': { textShadow: '0 0 20px #FFD700, 0 0 40px #FFD700' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
