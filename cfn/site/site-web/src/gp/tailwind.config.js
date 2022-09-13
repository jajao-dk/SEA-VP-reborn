/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors")
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './index.html',
    // './src/App.vue',
    './src/pages/*.{vue,js}',
    './src/pages/dashboard/**/*.{vue,js}'
  ],
  theme: {
    extend: {
      colors: {
        ...colors,
        background: "#177CBE",
        drawer_menu: "#37A0E6",
        color_2: "#95CFD5",
        color_3: "#FD7E50",
        black: "#310E3A",
        debug: colors.red[400]
        },
        fontFamily: {
          sans: ['Inter var', ...defaultTheme.fontFamily.sans],
        },
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
}
