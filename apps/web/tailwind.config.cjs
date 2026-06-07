/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        coal: "#0b0d10",
        panel: "#14171b",
        line: "#2a2f35",
        ember: "#e14a3b",
        signal: "#33d6c5",
        brass: "#e5b85c"
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "sans-serif"],
        display: ["Rajdhani", "Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};
