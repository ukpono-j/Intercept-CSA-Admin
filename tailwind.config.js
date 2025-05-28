export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#F59E0B', // Vibrant amber for primary elements
          600: '#D97706', // Slightly darker amber
          700: '#B45309', // Deep amber for active states
        },
        secondary: {
          500: '#6366F1', // Indigo for secondary elements
          600: '#4F46E5', // Darker indigo for hover
        },
        accent: {
          500: '#FBBF24', // Bright gold for accents
          600: '#F59E0B', // Slightly darker gold
        },
        background: {
          50: '#FFF7ED', // Soft, warm off-white for backgrounds
          100: '#FEE6C7', // Light peach for subtle gradients
        },
        border: '#E5E7EB', // Neutral gray for borders
        card: '#FFFFFF', // Clean white for cards
        sidebar: {
          light: '#FFF7ED', // Warm off-white for sidebar
          dark: '#1F2937', // Dark gray for contrast
        },
        text: {
          primary: '#1F2937', // Dark gray for readable text
          secondary: '#6B7280', // Lighter gray for secondary text
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(245, 158, 11, 0.3)' },
          '50%': { boxShadow: '0 0 15px rgba(245, 158, 11, 0.5)' },
        },
      },
    },
  },
  plugins: [],
};