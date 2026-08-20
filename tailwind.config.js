/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary colors with opacity support
        'primary-50': '#ecfdf5',
        'primary-100': '#d1fae5',
        'primary-200': '#a7f3d0',
        'primary-300': '#6ee7b7',
        'primary-400': 'rgb(var(--primary-400-rgb) / <alpha-value>)',
        'primary-500': 'rgb(var(--primary-500-rgb) / <alpha-value>)',
        'primary-600': 'rgb(var(--primary-600-rgb) / <alpha-value>)',
        'primary-700': '#047857',
        'primary-800': '#065f46',
        'primary-900': '#064e3b',
        'primary-950': '#022c22',
        
        // Dark theme colors
        'dark-bg-primary': '#0f0f0f',
        'dark-bg-secondary': '#1a1a1a',
        'dark-bg-tertiary': '#262626',
        'dark-border': '#404040',
        'dark-text-primary': '#ffffff',
        'dark-text-secondary': 'rgb(var(--dark-text-secondary-rgb) / <alpha-value>)',
        'dark-text-muted': '#a3a3a3',
        
        // Additional semantic colors
        'accent-500': '#8b5cf6',
        'neutral-50': '#fafafa',
        'neutral-100': '#f5f5f5',
        'neutral-200': '#e5e5e5',
        'neutral-300': '#d4d4d4',
        'neutral-400': '#a3a3a3',
        'neutral-500': '#737373',
        'neutral-600': '#525252',
        'neutral-700': '#404040',
        'neutral-800': '#262626',
        'neutral-900': '#171717',
        'neutral-950': '#0a0a0a',
        
        // Status colors
        'success-50': '#f0fdf4',
        'success-500': '#22c55e',
        'success-600': '#16a34a',
        'success-900': '#14532d',
        
        'warning-50': '#fffbeb',
        'warning-500': '#f59e0b',
        'warning-600': '#d97706',
        'warning-900': '#78350f',
        
        'error-50': '#fef2f2',
        'error-500': '#ef4444',
        'error-600': '#dc2626',
        'error-900': '#7f1d1d',
      },
      boxShadow: {
        'primary': '0 10px 15px -3px rgb(var(--primary-500-rgb) / 0.1), 0 4px 6px -4px rgb(var(--primary-500-rgb) / 0.1)',
        'glow': '0 0 20px rgb(var(--primary-500-rgb) / 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      transitionDuration: {
        '400': '400ms',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
};