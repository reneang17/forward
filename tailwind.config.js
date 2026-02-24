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
        },
        fw: {
          // Backgrounds — monsoon cloud tones (dark petrol blue-greens)
          'bg-deep':   '#111D22',  // deepest — midnight storm
          'bg':        '#182A30',  // primary — deep monsoon
          'bg-alt':    '#24383F',  // sidebar — stormy petrol
          'surface':   '#1E3038',  // card surfaces — dark teal cloud
          'surface-hover': '#2A3E47', // card hover — lifting storm
          // Borders
          'border':    '#3A5260',  // subtle borders — rain-washed
          'border-strong': '#5A7A8A', // prominent — cloud break
          // Text
          'text':      '#F2EEAE',  // main text
          'text-muted':'#CBD5E1',  // secondary text — bright mist gray
          'text-faint':'#5A7282',  // faint — mist
          // Accents (yellows)
          'accent':    '#F2D750',  // primary accent (buttons, active)
          'accent-bright': '#F2E205', // vivid accent
          'accent-soft': '#F2EEAE', // soft accent (matching text)
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
