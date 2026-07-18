import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        noir: "#050506",
        carbone: "#0c0d10",
        anthracite: "#15171c",
        acier: "#1e2128",
        gris: "#8a8f99",
        "gris-clair": "#c7ccd4",
        blanc: "#f4f5f7",
        orange: {
          DEFAULT: "#ff5a00",
          clair: "#ff8a3d",
        },
        edge: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "Impact", "sans-serif"],
        cond: ["var(--font-oswald)", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 34px rgba(255,90,0,0.45)",
      },
      keyframes: {
        drop: {
          "0%": { transform: "scaleY(0)", transformOrigin: "top" },
          "50%": { transform: "scaleY(1)", transformOrigin: "top" },
          "51%": { transformOrigin: "bottom" },
          "100%": { transform: "scaleY(0)", transformOrigin: "bottom" },
        },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
      animation: {
        drop: "drop 1.8s infinite",
        marquee: "marquee 22s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
