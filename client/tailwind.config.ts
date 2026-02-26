import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#DB4444", // червона акцентна кнопка
        secondary: "#F5F5F5", // світло-сірий фон
        dark: "#1D1F22", // темний текст
        gray: {
          light: "#F5F5F5",
          medium: "#7D8184",
          dark: "#1D1F22",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
