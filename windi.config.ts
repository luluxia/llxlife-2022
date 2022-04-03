import { defineConfig } from "vite-plugin-windicss";
function range(size, startAt = 1, step = 1) {
  return Array.from(Array(size).keys()).map(i => i * step + startAt);
};
export default defineConfig({
  safelist: [
    range(20, 10, 10).map(i => `!w-${i}`),
    range(20, 10, 10).map(i => `w-${i}`),
    range(10, 0, 10).map(i => `opacity-${i}`),
    range(10, 0, 10).map(i => `bg-opacity-${i}`),
  ],
});
