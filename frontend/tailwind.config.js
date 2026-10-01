/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background, #070709)',
        surface: '#0c0c0e',
        'surface-elevated': '#141418',
        accent: {
          DEFAULT: '#E5C158', // Luxury Cyber Gold
          hover: '#F3BA2F',
          glow: 'rgba(229, 193, 88, 0.2)'
        },
        muted: '#8b949e',
        border: 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
