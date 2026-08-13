/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      transitionTimingFunction: {
        'out-ios': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'in-out-ios': 'cubic-bezier(0.77, 0, 0.175, 1)',
        'drawer': 'cubic-bezier(0.32, 0.72, 0, 1)',
      }
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
