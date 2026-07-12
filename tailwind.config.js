/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          50: '#eff6ff',
          100: '#dbeafe',
          400: '#5b8ff5',
          500: '#2563EB',
          600: '#1d4fd1',
          700: '#1a3fb0',
        },
        secondary: {
          DEFAULT: '#7C3AED',
          400: '#9a63f0',
          500: '#7C3AED',
          600: '#6926d9',
        },
        accent: {
          DEFAULT: '#06B6D4',
          400: '#22cfe8',
          500: '#06B6D4',
          600: '#0596b0',
        },
        surface: {
          dark: '#0F172A',
          darkraised: '#151f38',
          light: '#F7F8FC',
          lightraised: '#EEF1F8',
        },
        ink: '#0F172A',
        line: {
          light: '#E2E6F0',
          dark: 'rgba(255,255,255,0.1)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-light': 'linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px)',
        'grid-dark': 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        'aurora': 'radial-gradient(40% 40% at 20% 20%, rgba(37,99,235,0.35) 0%, transparent 70%), radial-gradient(40% 40% at 80% 30%, rgba(124,58,237,0.3) 0%, transparent 70%), radial-gradient(50% 50% at 50% 80%, rgba(6,182,212,0.25) 0%, transparent 70%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
        'gradient-move': 'gradient-move 12s ease infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        blink: {
          '0%, 50%': { opacity: 1 },
          '50.01%, 100%': { opacity: 0 },
        },
        'gradient-move': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(37,99,235,0.45)',
        'glow-violet': '0 0 40px -10px rgba(124,58,237,0.45)',
        card: '0 1px 2px rgba(15,23,42,0.04), 0 14px 28px -16px rgba(15,23,42,0.14)',
        'card-hover': '0 1px 2px rgba(15,23,42,0.05), 0 24px 40px -18px rgba(37,99,235,0.22)',
        'card-dark': '0 1px 0 rgba(255,255,255,0.03) inset, 0 20px 36px -18px rgba(0,0,0,0.55)',
        nav: '0 1px 0 rgba(15,23,42,0.04), 0 12px 30px -18px rgba(15,23,42,0.15)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
}
