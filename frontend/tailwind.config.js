/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#F8D7E6',       // Soft Pink (Primary)
          lavender: '#DCCEF9',   // Pastel Lavender (Secondary)
          cream: '#FFF9F5',      // Cream White (Background)
          rosegold: '#B76E79',   // Rose Gold (Accent)
          gold: '#D4AF37',       // Soft Gold (Highlight)
          dark: '#1E1B18',       // Dark background for dark mode
          darkSecondary: '#2D2824', // Secondary dark background
          darkBorder: '#3E3732', // Border dark mode
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headings: ['Poppins', 'sans-serif'],
      },
      animation: {
        'fade-in':        'fade-in 0.4s ease-out both',
        'slide-in-up':    'slide-in-up 0.5s ease-out both',
        'slide-in-right': 'slide-in-right 0.4s ease-out both',
        'float':          'float 3s ease-in-out infinite',
        'pulse-gold':     'pulse-gold 2s infinite',
        'shimmer':        'shimmer 1.5s infinite',
        'sparkle':        'sparkle 2s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(30px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        'pulse-gold': {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(212,175,55,0.4)' },
          '50%':       { transform: 'scale(1.05)', boxShadow: '0 0 0 8px rgba(212,175,55,0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
          '50%':       { opacity: '0.6', transform: 'scale(1.2) rotate(15deg)' },
        },
      },
      boxShadow: {
        'rosegold': '0 4px 15px rgba(183, 110, 121, 0.3)',
        'gold':     '0 4px 15px rgba(212, 175, 55, 0.3)',
      },
    },
  },
  plugins: [],
}
