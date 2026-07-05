/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0b0f19',
        darkCard: '#151d30',
        brandYellow: '#f59e0b',
        brandYellowHover: '#d97706',
      },
    },
  },
  plugins: [],
}
