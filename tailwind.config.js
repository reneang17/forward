/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
            850: '#1e293b',
            900: '#0f172a',
        }
      },
      keyframes: {
          'fade-in': {
              '0%': { opacity: '0', transform: 'translateY(10px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          'scale-in': {
              '0%': { opacity: '0', transform: 'scale(0.95)' },
              '100%': { opacity: '1', transform: 'scale(1)' },
          }
      },
      animation: {
          'fade-in': 'fade-in 0.2s ease-out',
          'scale-in': 'scale-in 0.2s ease-out',
      }
    },
  },
  plugins: [],
}
