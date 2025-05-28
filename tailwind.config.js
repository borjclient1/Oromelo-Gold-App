/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        golden: '#FFD700',
        darkgold: '#A77F29',
        gold: {
          DEFAULT: '#BB902F',
          '50': '#FFFEF5',
          '100': '#FFFBDB',
          '200': '#FFF7AD',
          '300': '#FFF27F',
          '400': '#FFED50',
          '500': '#FFD700',
          '600': '#D1B000',
          '700': '#A38800',
          '800': '#756100',
          '900': '#473B00',
        },
      },
      backgroundColor: {
        'dark-surface': '#121212',
        'dark-surface-1': '#1E1E1E',
        'dark-surface-2': '#222222',
        'dark-surface-3': '#242424',
        'dark-surface-4': '#272727',
        'dark-surface-5': '#2C2C2C',
        'dark-elevated': '#383838',
      },
    },
  },
  plugins: [],
}
