export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      colors: {
        mainbrown: '#3d332a',
        sharkgray: '#212529',
        'sharkgray-light': '#272b2f',
        maingray: '#e6e6e6',
        'maingray-dark': '#dcdcdc',
        grayline: '#4a4a4a',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        'sourceserif4-18pt-regular': ['sourceserif4-18pt-regular', 'serif'],
        'sourceserif4-18pt-light': ['sourceserif4-18pt-light', 'serif'],
        'roboto-light': ['roboto-light', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
