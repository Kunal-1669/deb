const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",

  ],
  theme: {
    extend: {},
    colors: {
      ...colors,
      bblue: '#004aad',
      bdarkblue: '#1a3f70',
      bblack: '#333333',
      boffwhite: '#f0f3f8',
      boffwhiteandblue: '#e6effb',
    },
  },
  plugins: [],
}

