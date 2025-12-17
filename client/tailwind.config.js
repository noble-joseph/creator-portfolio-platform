/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base Premium Black
        black: {
          DEFAULT: '#000000',
          50: '#1a1a1a',
          100: '#171717',
          200: '#262626',
          300: '#404040',
          400: '#525252',
          500: '#737373',
          800: '#0a0a0a',
          900: '#050505', // Ultra dark
          950: '#020202',
        },

        // Musician Theme - Dark Wooden & Gold
        wood: {
          50: '#fbf7f5',
          100: '#f5ebe6',
          200: '#ebd5c9',
          300: '#ddbba8',
          400: '#ce9c82',
          500: '#b87858', // Warm brown
          600: '#8d6e63', // Amber/Varnish
          700: '#5d4037', // Dark Oak
          800: '#3f2e26', // Mahogany
          900: '#281c15', // Deep rich wood
          950: '#1a100c',
        },
        gold: {
          100: '#fcf9e8',
          200: '#fef3c7',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#d4af37', // Metallic Gold
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },

        // Photographer Theme - Cinematic Dark & Cool Blue
        cinematic: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0f172a', // Deep slate
          950: '#020617', // Void
        },
        cinemaAccent: {
          400: '#14b8a6', // Teal
          500: '#f97316', // Orange (Complementary)
          600: '#ea580c',
        },

        // Re-map neutrals for dark mode utility
        neutral: {
          50: '#171717',   // Inverted for dark mode logic
          100: '#262626',
          200: '#404040',
          800: '#d4d4d4',
          900: '#f5f5f5',  // Light text
        },

        // Keep standard errors/success but tweaked for dark bg
        success: { 500: '#10b981', 600: '#059669' },
        warning: { 500: '#f59e0b', 600: '#d97706' },
        error: { 500: '#ef4444', 600: '#dc2626' },
      },
      backgroundImage: {
        // Universal Premium Dark (Home, Login)
        'premium-dark': 'linear-gradient(to bottom, #000000, #0a0a0a, #121212)',
        'premium-shine': 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.05) 50%, transparent 75%)',

        // Musician Gradient (Radial Spotlight)
        'wood-gradient': 'radial-gradient(circle at center, #5d4037 0%, #3f2e26 40%, #1a100c 100%)',
        'wood-accent': 'linear-gradient(to right, #d4af37, #b45309)', // Gold to Bronze

        // Photographer Gradient (Cinematic Horizon)
        'cinematic-gradient': 'linear-gradient(to bottom, #020617 0%, #0f172a 40%, #000000 100%)',
        'cinematic-accent': 'linear-gradient(to right, #14b8a6, #f97316)', // Teal to Orange
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'], // Added for premium/wooden feel
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(234, 179, 8, 0.15)',
        'glow-blue': '0 0 20px rgba(14, 165, 233, 0.15)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 4px 25px -5px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 50px -12px rgba(0, 0, 0, 0.25)',
        'glow': '0 0 20px rgba(139, 92, 246, 0.25)',
        'glow-lg': '0 0 30px rgba(139, 92, 246, 0.35)',
        'glow-musician': '0 0 30px rgba(139, 92, 246, 0.3)',
        'glow-photographer': '0 0 30px rgba(20, 184, 166, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(139, 92, 246, 0.1)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 30px -5px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        'safe': 'env(safe-area-inset-bottom)',
      },
      borderRadius: {
        '4xl': '2rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
