/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accentBlue: '#2563eb',
        accentCyan: '#0284c7',
        accentGreen: '#10b981',
        accentRed: '#ef4444',
        accentAmber: '#f59e0b',
        accentPurple: '#8b5cf6'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
