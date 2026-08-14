/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Navy Blue - Primary (Trust & Luxury). Brand color #0F3D5E sits at 600,
        // so existing `bg-primary-600 hover:bg-primary-700` button styles
        // automatically become "navy, hover slightly darker navy" with zero
        // per-component changes.
        primary: {
          50: '#EAF1F5',
          100: '#D3E1EA',
          200: '#A7C3D5',
          300: '#7BA5C0',
          400: '#4F87AB',
          500: '#1B5478',
          600: '#0F3D5E', // brand navy
          700: '#0A2C44', // hover
          800: '#08202F',
          900: '#051620',
        },
        // Sage Green - Accent (Health). Brand color #6FAF8F sits at 500.
        accent: {
          50: '#F0F8F4',
          100: '#DCEEE3',
          200: '#B9DDC8',
          300: '#96CCAC',
          400: '#82BE9C',
          500: '#6FAF8F', // brand sage
          600: '#5B9A7A', // hover
          700: '#4A8267',
          800: '#396350',
          900: '#294839',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};