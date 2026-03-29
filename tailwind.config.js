/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sky: {
          dark: '#0f4c81',
          DEFAULT: '#1a6fad',
        },
        teal: {
          DEFAULT: '#0d9488',
          light: '#14b8a6',
        },
      },
    },
  },
  plugins: [],
}
