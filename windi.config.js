import { defineConfig } from "vite-plugin-windicss";
function range(size, startAt = 1, step = 1) {
  return Array.from(Array(size).keys()).map(i => i * step + startAt);
};
export default defineConfig({
  theme: {
    extend: {
      boxShadow: {
        box: '3px 3px rgb(0 0 0 / 10%)',
      },
      animation: {
        shake: 'shake-bottom 1s linear infinite',
      },
      colors: {
        'purple': '#A39EBC',
        'purple-light': '#E4E2EB',
        'purple-dark': '#857988',
        'blue': '#89D7F0',
        'blue-light': '#DCF3FB',
        'blue-dark': '#2EBAF5',
        'pink': '#FFBACD',
        'pink-light': '#FFEAF0',
        'pink-dark': '#FF8EA3',
        'yellow': '#FFD08B',
        'yellow-dark': '#FFAC5E',
        'yellow-light': '#FFF1DC',
        'green': '#9EDA92',
        'green-dark': '#7FBF4F',
        'green-light': '#E2F4DF',
        'red': '#B48081',
        'red-dark': '#A66869',
        'red-light': '#E9D9D9',
        'default': '#FFFAF3'
      },
    },
  },
  shortcuts: {
    'theme-purple': 'bg-purple-light !border-purple text-purple-dark',
    'theme-blue': 'bg-blue-light !border-blue text-blue-dark',
    'theme-pink': 'bg-pink-light !border-pink text-pink-dark',
    'theme-yellow': 'bg-yellow-light !border-yellow text-yellow-dark',
    'theme-green': 'bg-green-light !border-green text-green-dark',
    'theme-red': 'bg-red-light !border-red text-red-dark',
  },
  safelist: [
    range(10, 10, 10).map(i => `w-${i}`),
  ],
});
