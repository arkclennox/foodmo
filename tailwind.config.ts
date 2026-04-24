import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#01083C',
          50: '#EEF0F9',
          100: '#D9DDEF',
          200: '#AEB5D9',
          300: '#828CC2',
          400: '#5763AC',
          500: '#2C3A95',
          600: '#1F2B75',
          700: '#141C56',
          800: '#0A1038',
          900: '#01083C',
        },
        soft: '#F8FAFC',
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Arial', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(1,8,60,0.06)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
