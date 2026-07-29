import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Georgia", "Cambria", "'Times New Roman'", "Times", "serif"],
      },
      colors: {
        blush: {
          50: "#fdf6f4",
          100: "#faeae6",
          200: "#f3d1c8",
          300: "#e8b0a1",
          400: "#d9866f",
          500: "#c66549",
          600: "#a94f38",
          700: "#8a3e2c",
        },
        sage: {
          50: "#f4f6f3",
          100: "#e5eae1",
          200: "#c9d4c1",
          300: "#a6b89a",
          400: "#849a75",
          500: "#697f5b",
          600: "#516347",
        },
      },
    },
  },
  plugins: [],
};

export default config;
