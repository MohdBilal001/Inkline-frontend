/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F6F4EF',
        'paper-dim': '#EFEBE2',
        ink: '#1C1B19',
        'ink-soft': '#4A473F',
        muted: '#8C877D',
        line: '#DDD8CC',
        accent: {
          DEFAULT: '#2F5233',
          soft: '#7A9A7E',
          tint: '#E4EAE1'
        },
        brick: {
          DEFAULT: '#8B3A3A',
          tint: '#F2E2E0'
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        serif: ['"Source Serif 4"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      maxWidth: {
        measure: '42rem'
      }
    }
  },
  plugins: []
}
