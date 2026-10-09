/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#030817',
          900: '#050B1C',
          800: '#061027',
          700: '#091532',
        },
        primary: {
          blue: '#208CFF',
          cyan: '#25C8FF',
        },
        accent: {
          purple: '#7B4DFF',
          violet: '#A855F7',
          pink: '#C45CFF',
        },
        text: {
          main: '#F8FAFF',
          secondary: '#C5D2EC',
          muted: '#8FA2C7',
        },
        success: '#2DD4A3',
        warning: '#F5B544',
        danger: '#FF5C70',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        glass: '20px',
      },
      boxShadow: {
        glass: '0 10px 40px rgba(0, 0, 0, 0.2)',
        glowBlue:
          '0 0 16px rgba(32, 140, 255, 0.28), 0 0 28px rgba(123, 77, 255, 0.1)',
        glowCyan: '0 0 14px rgba(37, 200, 255, 0.32)',
      },
      animation: {
        'fade-up': 'fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
