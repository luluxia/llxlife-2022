import { defineConfig } from "vite-plugin-windicss";
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
        purple: '#A39EBC',
        blue: '#89D7F0',
        pink: '#FFBACD',
        yellow: '#FFD08B',
        green: '#9EDA92',
        red: '#B48081',
        default: '#FFFAF3'
      }
    },
  },
});
