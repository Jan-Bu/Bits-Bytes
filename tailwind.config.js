/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'jersey': ['Jersey 25', 'cursive'],
        'ubuntu': ['Ubuntu Sans', 'sans-serif'],
      },
      colors: {
        'dark-purple': '#1e0c53',
        'bright-yellow': '#fffc00',
        'light-turquoise': '#85fbff',
        'pale-turquoise': '#bbfffc',
      },
    },
  },
  plugins: [],
};