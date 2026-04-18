/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#170b0d",
        secondary: "#241114",
        tertiary: "#3a191d",
        surface: {
          base: "#231316",
          elevated: "#32191d",
          muted: "#4b252b"
        },
        accent: {
          green: "#e23628",
          emerald: "#b51e25",
          blue: "#f2c9bf",
          cyan: "#f7e4dc",
          purple: "#7e1720",
          amber: "#d6a15f",
          rose: "#ef5548"
        }
      },
      fontFamily: {
        heading: ["Space Grotesk", "sans-serif"],
        body: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"]
      },
      boxShadow: {
        glass: "0 22px 50px rgba(55, 15, 20, 0.2)",
        depth: "0 28px 72px rgba(41, 10, 15, 0.26)",
        accent: "0 18px 44px rgba(226, 54, 40, 0.18)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at 14% 16%, rgba(226,54,40,0.17), transparent 25%), radial-gradient(circle at 86% 12%, rgba(126,23,32,0.2), transparent 30%), radial-gradient(circle at 48% 100%, rgba(214,161,95,0.1), transparent 34%)",
        "surface-mesh":
          "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04)), radial-gradient(circle at top right, rgba(226,54,40,0.16), transparent 32%), radial-gradient(circle at left, rgba(126,23,32,0.18), transparent 28%)"
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
