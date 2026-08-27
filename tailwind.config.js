/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0e1a',
        surface: '#111827',
        card: '#1a2035',
        cardHover: '#1f2847',
        borderCustom: 'rgba(99, 128, 255, 0.15)',
        accentBlue: '#6380ff',
        accentCyan: '#22d3ee',
        accentGreen: '#34d399',
        accentRed: '#f87171',
        accentAmber: '#fbbf24',
        accentPurple: '#a78bfa'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
