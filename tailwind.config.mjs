/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

export default {
  mode: "jit",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#98C6CE",
        secondary: "#24474D",
      },
      fontFamily: {
        chonburi: ['Chonburi'],
        judson: ['Judson', 'serif'],
        jua: ['Jua', 'sans-serif'],
      }
    },
  },


  plugins: [],
};
