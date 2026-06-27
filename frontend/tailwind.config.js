/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#081226",
        navy: "#0c1b35",
        electric: "#2f7df6",
        cyan: "#41d7ff",
      },
      boxShadow: {
        glow: "0 18px 50px rgba(32, 105, 255, 0.18)",
      },
    },
  },
  plugins: [],
};
