export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'xs': '360px', // menší Android mobily
        'ms': '400px', // větší Android mobily
        'ts': '600px', // malé tablety
        'tl': '768px', // velké tablety
      },

      fontFamily: {
        jersey: ['"Jersey 25"', 'cursive'],
      },
      colors: {
        'dark-purple': '#1e0c53',
        'bright-yellow': '#fffc00',
        'light-turquoise': '#85fbff',
        'pale-turquoise': '#bbfffc',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': {
            transform: 'translate(-50%, -50%) translateX(-10px)',
          },
          '50%': {
            transform: 'translate(-50%, -50%) translateX(10px)',
          },
        },
      },
      animation: {
        wiggle: 'wiggle 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
