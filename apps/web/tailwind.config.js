/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F8EDE3',
        surface: '#DFD3C3',
        'accent-2': '#D0B8A8',
        brand: '#85586F',
        'brand-hover': '#6B4559',
        ink: '#1A1A1A',
        white: '#FFFFFF',
        disabled: '#6B6B6B'
      },
      fontFamily: {
        display: ['"Archivo Black"', 'sans-serif'],
        body: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace']
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '5': '5px'
      },
      boxShadow: {
        xs: '3px 3px 0px #1A1A1A',
        sm: '4px 4px 0px #1A1A1A',
        md: '6px 6px 0px #1A1A1A',
        lg: '8px 8px 0px #1A1A1A',
        xl: '10px 10px 0px #1A1A1A'
      },
      animation: {
        marquee: 'marquee 25s linear infinite'
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      }
    }
  },
  plugins: []
};
