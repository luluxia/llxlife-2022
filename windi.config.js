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
        'purple-light': '#F1F0F5',
        'purple-dark': '#857988',
        'blue': '#89D7F0',
        'blue-light': '#EDF9FD',
        'blue-dark': '#2EBAF5',
        'pink': '#FFBACD',
        'pink-light': '#FFF4F7',
        'pink-dark': '#FF8EA3',
        'yellow': '#FFD08B',
        'yellow-light': '#FFF8ED',
        'yellow-dark': '#FFAC5E',
        'green': '#9EDA92',
        'green-light': '#F0F9EF',
        'green-dark': '#7FBF4F',
        'red': '#B48081',
        'red-light': '#F4ECEC',
        'red-dark': '#A66869',
        'default': '#FFFAF3'
      },
      fontFamily: {
        default: ['SweiGothicCJKtc-Medium', 'Microsoft YaHei', 'sans-serif'],
      }
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
    range(10, 10, 10).map(i => `!w-${i}`),
  ],
});
