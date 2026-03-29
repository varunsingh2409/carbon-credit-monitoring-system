/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0f172a",
        secondary: "#172335",
        tertiary: "#22314a",
        surface: {
          base: "#101b2d",
          elevated: "#162338",
          muted: "#21304a"
        },
        accent: {
          green: "#22c55e",
          emerald: "#10b981",
          blue: "#3b82f6",
          cyan: "#22d3ee",
          purple: "#8b5cf6",
          amber: "#f59e0b",
          rose: "#fb7185"
        }
      },
      fontFamily: {
        heading: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"]
      },
      boxShadow: {
        glass: "0 26px 60px rgba(8, 15, 30, 0.32)",
        depth: "0 28px 90px rgba(4, 9, 20, 0.42)",
        accent: "0 22px 56px rgba(34, 197, 94, 0.16)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at 15% 18%, rgba(16,185,129,0.16), transparent 24%), radial-gradient(circle at 88% 12%, rgba(59,130,246,0.18), transparent 30%), radial-gradient(circle at 50% 100%, rgba(245,158,11,0.08), transparent 32%)",
        "surface-mesh":
          "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), radial-gradient(circle at top right, rgba(59,130,246,0.12), transparent 32%), radial-gradient(circle at left, rgba(34,197,94,0.12), transparent 28%)"
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
