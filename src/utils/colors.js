// src/utils/colors.js
const colors = {
  customProperties: {
    '--bg-light': 'hsl(220, 25%, 97%)',
    '--bg-dark': 'hsl(220, 35%, 8%)',
    '--text-primary': 'hsl(220, 25%, 15%)',
    '--text-secondary': 'hsl(220, 20%, 45%)',
    '--text-tertiary': 'hsl(220, 15%, 65%)',
    '--text-white': 'hsl(0, 0%, 100%)',
    '--primary': 'hsl(14, 100%, 57%)',
    '--primary-dark': 'hsl(14, 100%, 47%)',
    '--primary-light': 'hsl(14, 100%, 67%)',
    '--accent': 'hsl(280, 85%, 60%)',
    '--accent-dark': 'hsl(280, 85%, 50%)',
    '--accent-light': 'hsl(280, 85%, 70%)',
    '--success': 'hsl(142, 70%, 50%)',
    '--warning': 'hsl(38, 95%, 55%)',
    '--info': 'hsl(210, 90%, 58%)',
    '--border-light': 'hsl(220, 25%, 85%)',
    '--border-medium': 'hsl(220, 25%, 75%)',
    '--card-bg': 'hsl(0, 0%, 100%)',
    '--card-hover': 'hsl(220, 25%, 99%)',
    '--glass-bg': 'rgba(255, 255, 255, 0.95)',
    '--shadow-light': '0 2px 10px rgba(0, 0, 0, 0.05)',
    '--shadow-medium': '0 4px 20px rgba(0, 0, 0, 0.08)',
    '--shadow-heavy': '0 8px 30px rgba(0, 0, 0, 0.1)',
  },
  gradients: {
    primary: 'linear-gradient(90deg, hsl(14, 100%, 67%) 0%, hsl(14, 100%, 47%) 100%)',
    secondary: 'linear-gradient(90deg, hsl(280, 85%, 70%) 0%, hsl(280, 85%, 50%) 100%)',
  },
  applyTheme: () => {
    const root = document.documentElement;
    Object.entries(colors.customProperties).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  },
};

export default colors;