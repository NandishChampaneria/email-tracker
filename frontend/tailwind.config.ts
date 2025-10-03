import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          bg: '#0b0f17',
          panel: 'rgba(255,255,255,0.06)',
          border: 'rgba(255,255,255,0.12)'
        }
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        glass: '0 10px 30px rgba(0,0,0,0.35)'
      }
    },
  },
  plugins: [],
} satisfies Config
