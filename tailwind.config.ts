import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#edfdf4",
          100: "#d5f7e4",
          200: "#aeeccf",
          300: "#78dbb0",
          400: "#3fbd8c",
          500: "#249f73",
          600: "#16815e",
          700: "#12674d",
          800: "#11523f",
          900: "#0f4436"
        }
      },
      boxShadow: {
        soft: "0 16px 45px rgba(15, 68, 54, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
