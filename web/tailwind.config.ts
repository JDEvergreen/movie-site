import type { Config } from "tailwindcss";

// Whimsical design system: cream "paper" base + a rotating set of soft pastels,
// organic shapes, characterful type. Playful but legible (light mode).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // paper + ink
        paper: { DEFAULT: "#FFFBF0", deep: "#FBF0D6", edge: "#F0E2C2" },
        ink: { DEFAULT: "#3B322C", soft: "#857669", faint: "#B6A795" },
        // warm summer palette: coral / yellow / teal shades (sync with pastels.ts)
        blush: { DEFAULT: "#F8C2AD", deep: "#C25C3E" },
        peach: { DEFAULT: "#F8B093", deep: "#CE5E34" },
        butter: { DEFAULT: "#FCE08C", deep: "#B08612" },
        mint: { DEFAULT: "#8FDCDC", deep: "#1F8A8A" },
        sky: { DEFAULT: "#5FC9CA", deep: "#156A6A" },
        lilac: { DEFAULT: "#F6CF77", deep: "#9E7611" },
        coral: { DEFAULT: "#F5906B", deep: "#C8502C" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        blob: "42% 58% 56% 44% / 50% 44% 56% 50%",
        blob2: "58% 42% 38% 62% / 44% 58% 42% 56%",
        squircle: "1.75rem",
      },
      boxShadow: {
        sticker: "0 6px 0 -2px rgba(59,50,44,0.10), 0 10px 20px -8px rgba(59,50,44,0.20)",
        lift: "0 12px 30px -12px rgba(59,50,44,0.30)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0) rotate(var(--tw-rotate,0))" },
          "50%": { transform: "translateY(-8px) rotate(var(--tw-rotate,0))" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        breathe: {
          "0%,100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
        pop: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "70%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        jiggle: {
          "0%,100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        wobble: {
          "0%,100%": { transform: "translateY(0) rotate(-1.5deg)" },
          "50%": { transform: "translateY(-10px) rotate(1.5deg)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        wiggle: "wiggle 0.4s ease-in-out",
        breathe: "breathe 4s ease-in-out infinite",
        pop: "pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
        jiggle: "jiggle 2.4s ease-in-out infinite",
        marquee: "marquee 48s linear infinite",
        wobble: "wobble 7s ease-in-out infinite",
        "spin-slow": "spin 16s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
