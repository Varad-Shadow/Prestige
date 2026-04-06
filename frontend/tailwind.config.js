/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        prestige: {
          dark: '#0a0a0a',
          card: '#171717',
          accent: '#d4af37', // Gold
          text: '#f8fafc',
          muted: '#a3a3a3'
        }
      }
    },
  },
  plugins: [],
}
