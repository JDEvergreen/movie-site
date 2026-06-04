import type { Config } from "tailwindcss";

// Design system (PLAN §10): warm film-journal palette, light mode default.
// Humanist sans for UI, display serif for titles/headings.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FBF6EC",
          50: "#FFFDF8",
          100: "#FBF6EC",
          200: "#F3E9D6",
        },
        teal: {
          DEFAULT: "#1F8A8A",
          600: "#176E6E",
          400: "#3BA8A8",
        },
        coral: {
          DEFAULT: "#F2745C",
          600: "#DB5942",
        },
        sunny: {
          DEFAULT: "#F2C14E",
          600: "#E0A92E",
        },
        ink: {
          DEFAULT: "#2B2522",
          soft: "#5B524C",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: {
        card: "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
