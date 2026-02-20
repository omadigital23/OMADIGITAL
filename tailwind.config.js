/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        oma: {
          orange: '#F97316',
          'orange-light': '#FB923C',
          'orange-dark': '#EA580C',
          dark: '#111827',
          'dark-soft': '#1F2937',
          light: '#F9FAFB',
          white: '#FFFFFF',
          gray: '#6B7280',
          'gray-light': '#F3F4F6',
          'gray-border': '#E5E7EB',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'oma-sm': '0 2px 8px 0 rgba(249,115,22,0.12)',
        'oma-md': '0 4px 20px 0 rgba(249,115,22,0.18)',
        'oma-lg': '0 8px 40px 0 rgba(249,115,22,0.22)',
        'oma-card': '0 2px 16px 0 rgba(17,24,39,0.08)',
      },
      backgroundImage: {
        'oma-gradient': 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
        'oma-gradient-dark': 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
        'oma-gradient-light': 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out both',
        'fade-in': 'fadeIn 0.4s ease-out both',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      borderRadius: {
        'oma': '12px',
        'oma-lg': '20px',
        'oma-xl': '28px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}