import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          50:  '#faf6f0',
          100: '#f2e8d5',
          200: '#e5d3b3',
          300: '#d4b988',
          400: '#c4a265',
          500: '#9A7B4F',
          600: '#856A42',
          700: '#6F5836',
          800: '#5A472C',
          900: '#3D3120',
          950: '#261E14',
        },
        forest: {
          50:  '#edf5f2',
          100: '#d3e8e0',
          200: '#a7d1c1',
          300: '#6fb89d',
          400: '#3d9a7a',
          500: '#134538',
          600: '#0f3a2f',
          700: '#0c2e25',
          800: '#09231c',
          900: '#061813',
        },
        heritage: {
          50:  '#fdf2f4',
          100: '#fbe5e9',
          200: '#f5c5ce',
          300: '#ed9baa',
          400: '#d96a7f',
          500: '#6B2737',
          600: '#5a2130',
          700: '#4a1b28',
          800: '#3a1520',
          900: '#2a0f18',
        },
        surface: {
          DEFAULT: '#ffffff',
          50:  '#FAF9F7',
          100: '#F5F3EF',
          200: '#ECE8E1',
        },
        sidebar: '#1C1917',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        'card-lg': '0 4px 16px 0 rgb(0 0 0 / 0.08)',
        'gold-glow': '0 4px 24px 0 rgba(154, 123, 79, 0.15)',
      },
    },
  },
  plugins: [],
}

export default config
