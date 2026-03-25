import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        slate: {
          950: "#07111f",
        },
        brass: "#b0893a",
        skyglass: "#eef5ff",
        success: "#0f9f6e",
        warning: "#b76e00",
        danger: "#c83f49",
      },
      boxShadow: {
        panel: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
      },
      backgroundImage: {
        "soft-grid":
          "linear-gradient(rgba(17, 24, 39, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(17, 24, 39, 0.03) 1px, transparent 1px)",
      },
      fontFamily: {
        sans: ["Aptos", "\"Segoe UI\"", "\"Helvetica Neue\"", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

