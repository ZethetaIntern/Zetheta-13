/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1F4E79',
          'blue-dark': '#153655',
          'blue-light': '#2A68A0',
          'blue-subtle': '#EEF4FA',
          green: '#27AE60',
          'green-dark': '#219653',
          'green-light': '#6FCF97',
          'green-subtle': '#EAF7EE',
          red: '#E74C3C',
          'red-dark': '#C0392B',
          'red-subtle': '#FDF2F2',
          amber: '#F39C12',
          'amber-dark': '#D68910',
          'amber-subtle': '#FEF9E7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
}
