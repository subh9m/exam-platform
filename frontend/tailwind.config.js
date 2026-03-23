/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'n-blue-900': '#002466',
        'n-blue-700': '#0052cc',
        'n-blue-500': '#007aff',
        'n-blue-300': '#66a4ff',
        'n-white': '#ffffff',
        'n-black': '#000000',
      },
      borderRadius: { lg: '14px' },
      boxShadow: {
        'n-focus': '0 6px 18px rgba(0,122,255,0.25)',
        'n-card': '0 10px 30px rgba(0,0,0,0.35)',
      },
      transitionTimingFunction: {
        'springish': 'cubic-bezier(.2,1.05,.3,1)',
      },
    },
  },
  plugins: [],
};
