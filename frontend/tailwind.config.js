/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#18232d",
        secondary: "#23313d",
        tertiary: "#324453",
        surface: {
          base: "#22303b",
          elevated: "#2b3a46",
          muted: "#3a4a58"
        },
        accent: {
          green: "#73b88f",
          emerald: "#65b8a5",
          blue: "#7fa7d9",
          cyan: "#84c8d0",
          purple: "#9d8ed1",
          amber: "#d4b071",
          rose: "#d98799"
        }
      },
      fontFamily: {
        heading: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"]
      },
      boxShadow: {
        glass: "0 22px 50px rgba(31, 43, 57, 0.18)",
        depth: "0 28px 72px rgba(26, 36, 49, 0.2)",
        accent: "0 18px 44px rgba(115, 184, 143, 0.18)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at 14% 16%, rgba(115,184,143,0.15), transparent 25%), radial-gradient(circle at 86% 12%, rgba(127,167,217,0.16), transparent 30%), radial-gradient(circle at 48% 100%, rgba(212,176,113,0.08), transparent 34%)",
        "surface-mesh":
          "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04)), radial-gradient(circle at top right, rgba(127,167,217,0.14), transparent 32%), radial-gradient(circle at left, rgba(115,184,143,0.14), transparent 28%)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" }
        }
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "pulse-soft": "pulse-soft 5s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
