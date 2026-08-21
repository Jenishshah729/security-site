/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#090a0f', // True off-black for hacker vibe
        surface: '#11141c',
        'surface-elevated': '#181c26',
        accent: {
          DEFAULT: '#00ff66', // Neon green
          hover: '#00cc52',
          glow: 'rgba(0, 255, 102, 0.2)'
        },
        cyan: {
          DEFAULT: '#0ea5e9',
          glow: 'rgba(14, 165, 233, 0.2)'
        },
        muted: '#8b949e',
        border: 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
