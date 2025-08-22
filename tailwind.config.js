/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brun: "#761B00",
        jaune: "#FFF3C4",
        rouge: "#E2572E",
        orange: "#FF9D00",
      },
      fontFamily: {
        caveat: ["Caveat Brush", "cursive"],
        quicksand: ["Quicksand", "sans-serif"],
      },
    },
  },
  plugins: [],
}

