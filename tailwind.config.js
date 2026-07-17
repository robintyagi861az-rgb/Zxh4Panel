/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#0B0813",
        obsidian2: "#080510",
        panel: "#141022",
        amethyst: {
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
        },
        fuchsia: {
          500: "#D946EF",
        },
      },
      boxShadow: {
        glow: "0 0 15px rgba(168, 85, 247, 0.15)",
        glowLg: "0 0 30px rgba(168, 85, 247, 0.25)",
      },
      backgroundImage: {
        "amethyst-gradient": "linear-gradient(90deg, #7C3AED 0%, #D946EF 100%)",
      },
    },
  },
  plugins: [],
};
