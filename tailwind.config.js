/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "app-dark-1": "#1D1F21",
        "app-dark-2": "#131313",
        "app-dark-3": "#242424",
        "app-dark-4": "#424242",
        "app-light": "#E6E6E8",
        "app-accent-1": "#BDE8FE",
        "app-accent-2": "#114971",
      },
      fontFamily: {
        myFont: ["myFont", "sans-serif"],
      },
    },
  },
  plugins: [],
};
