/** @type {import('tailwindcss').Config} */
export default {
  content: [
    'index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './src/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      smooch: ['Smooch Sans', 'sans-serif'],
      londrina: ['Londrina Outline', 'sans-serif'],
      erica: ['Erica One', 'sans-serif'],
      bench: ['BenchNine', 'sans-serif'],
      abel: ['Abel', 'sans-serif'],
    },
    fontWeight: {
      thin: 100,
      xtralight: 200,
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      xbold: 800,
      xxbold: 900,
    },
    extend: {
      colors: {
        'primary-dark-blue': '#100E17',
        'primary-dark-gray': '#1C1C1C',
        'primary-light-fill': '#FBFBF7',
        'toolbox-gray': '#212121',
        'button-disabled-fill': 'rgba(0, 0, 0, .2)',
        'button-unabled-fill': 'rgba(215, 220, 225, .4)',
      },
      screens: {
        xxs: '360px',
        xs: '375px',
        sm: '412px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
        '3xl': '1536px',
        '4xl': '1920px',
        '5xl': '2560px',
        '6xl': '3440px',
        short: { raw: '(max-height: 768px) and (min-width: 1440px)' },
        xshort: { raw: '(max-height: 550px) and (min-width: 1020px)' },
      },
    },
  },
  plugins: [],
};
