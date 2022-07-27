const defaultTheme = require('tailwindcss/defaultTheme');
const forms = require('@tailwindcss/forms');
const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./public/*.html', './src/**/*.{js,jsx}'],
  theme: {
    fontSize: {
      xs: '.75rem',
      sm: '0.8rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem',
      '7xl': '5rem',
    },
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
        green: colors.emerald,
        yellow: colors.amber,
        purple: colors.violet,
        gray: colors.neutral,
        current: 'currentColor',
      },
      animation: {
        show: 'show 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        show: {
          '0%': { opacity: 0, transform: 'translateY(2px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [forms],
};
