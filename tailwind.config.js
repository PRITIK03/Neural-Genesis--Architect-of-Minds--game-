/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neural: {
          blue: 'var(--neural-blue)',
          purple: 'var(--neural-purple)',
          green: 'var(--neural-green)',
          red: 'var(--neural-red)',
          yellow: 'var(--neural-yellow)',
        },
        bg: {
          app: 'var(--bg-app)',
          panel: 'var(--bg-panel)',
          elevated: 'var(--bg-elevated)',
        },
        border: {
          subtle: 'var(--border-subtle)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          dim: 'var(--text-dim)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}