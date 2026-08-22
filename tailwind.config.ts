import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#3B82F6",
          dark: "#2563EB",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          700: "#1D4ED8",
        },
        status: {
          present: "#22C55E",
          "on-leave": "#F59E0B",
          absent: "#EAB308",
          pending: "#94A3B8",
          approved: "#22C55E",
          rejected: "#EF4444",
        },
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      width: {
        sidebar: "240px",
      },
      height: {
        topbar: "56px",
      },
      spacing: {
        sidebar: "240px",
        topbar: "56px",
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out forwards",
        "slide-in-left": "slide-in-left 0.25s ease-out forwards",
        "overlay-fade": "overlay-fade 0.2s ease-out forwards",
        "scale-in": "scale-in 0.2s ease-out forwards",
        "skeleton-pulse": "skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
