const defaultTheme = require('tailwindcss/defaultTheme');
const forms = require('@tailwindcss/forms');
const colors = require('tailwindcss/colors');

module.exports = {
  mode: 'jit',
  purge: ['./public/*.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        rose: colors.rose,
        fuchsia: colors.fuchsia,
        indigo: colors.indigo,
        teal: colors.teal,
        sky: colors.sky,
        lime: colors.lime,
        orange: colors.orange,
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [forms],
};
