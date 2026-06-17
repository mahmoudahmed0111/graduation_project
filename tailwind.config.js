/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Beni-Suef University colors from logo
        primary: {
          50: '#e6f0ff',
          100: '#b3d1ff',
          200: '#80b2ff',
          300: '#4d93ff',
          400: '#1a74ff',
          500: '#0055cc', // Main dark blue
          600: '#0044a3',
          700: '#003380',
          800: '#00225c',
          900: '#001139',
          950: '#000823',
        },
        accent: {
          50: '#fffef0',
          100: '#fff9c4',
          200: '#fff498',
          300: '#ffef6c',
          400: '#ffea40',
          500: '#ffd700', // Gold/Yellow
          600: '#ccac00',
          700: '#998100',
          800: '#665600',
          900: '#332b00',
          950: '#1a1500',
        },
        // Brand-aligned dark surfaces. Slightly tinted blue-navy to match the
        // logo identity instead of pure neutral slate. Nested under `brand`
        // because top-level hyphenated names collide with `@apply` resolution.
        brand: {
          bg: '#0a1428',           // page background — deep navy-black
          surface: '#101e3a',      // cards / panels — one step lighter
          'surface-2': '#162647',  // hovered cards / nested panels
          elev: '#1d3057',         // popovers, inputs on focus
          border: '#243b6b',       // border on dark surfaces
          'border-strong': '#2f4e8c',
        },
        // Aliases kept for the existing usages of `dark-bg` / `dark-surface`
        // / `dark-border` already sprinkled across the codebase.
        'dark-bg': '#0a1428',
        'dark-surface': '#101e3a',
        'dark-surface-2': '#162647',
        'dark-elev': '#1d3057',
        'dark-border': '#243b6b',
        'dark-border-strong': '#2f4e8c',
        sun: {
          light: '#ffeb3b',
          base: '#ff9800',
          dark: '#f57c00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // Display face for headings / titles — matches the CRM's
        // 'Plus Jakarta Sans' usage. Use via `font-display`.
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      // ─── Standardized elevation scale (premium, brand-tinted) ───────────
      // A single, consistent shadow ramp replaces the ad-hoc shadow-sm /
      // shadow-md / shadow-xl mix sprinkled across pages.
      boxShadow: {
        soft: '0 8px 24px -10px rgba(10, 20, 40, 0.10), 0 2px 6px -2px rgba(10, 20, 40, 0.06)',
        card: '0 12px 30px -16px rgba(10, 20, 40, 0.14), 0 2px 8px -4px rgba(10, 20, 40, 0.08)',
        'card-hover': '0 20px 44px -18px rgba(10, 20, 40, 0.22), 0 6px 14px -6px rgba(10, 20, 40, 0.12)',
        elevated: '0 24px 60px -24px rgba(10, 20, 40, 0.30)',
        'focus-ring': '0 0 0 3px rgba(0, 85, 204, 0.18)',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      maxWidth: {
        content: '1400px',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'gradient': 'gradient 15s ease infinite',
        // New premium primitives
        'enter': 'enterUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'modal-in': 'modalIn 0.26s cubic-bezier(0.22, 1, 0.36, 1) both',
        'backdrop-in': 'backdropIn 0.2s ease-out both',
        'shimmer': 'shimmer 1.6s ease-in-out infinite',
        'pop-in': 'popIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      keyframes: {
        enterUp: {
          '0%': { opacity: '0', transform: 'translate3d(0, 12px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        modalIn: {
          '0%': { opacity: '0', transform: 'translate3d(0, 16px, 0) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0) scale(1)' },
        },
        backdropIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
}

