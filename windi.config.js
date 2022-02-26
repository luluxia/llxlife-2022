import { defineConfig } from "vite-plugin-windicss";
export default defineConfig({
  theme: {
    extend: {
      boxShadow: {
        box: '3px 3px rgb(0 0 0 / 10%)',
      },
      animation: {
        shake: 'shake-bottom 1s linear infinite',
      }
    },
  },
});
