/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#04060A',
          900: '#070A10',
          850: '#0B0F18',
          800: '#101623',
          750: '#161E30',
          700: '#1D273D',
          600: '#2A3754',
          500: '#3D4F75',
        },
        cyber: {
          cyan: '#00F2FE',
          emerald: '#10B981',
          crimson: '#F43F5E',
          amber: '#F59E0B',
          purple: '#8B5CF6',
          blue: '#3B82F6',
        }
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
        'radial-glow': "radial-gradient(circle at 50% 0%, rgba(0, 242, 254, 0.08), transparent 70%)",
        'card-gradient': "linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)",
      },
      backgroundSize: {
        'grid-sm': '24px 24px',
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 242, 254, 0.25)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        'glow-crimson': '0 0 25px -5px rgba(244, 63, 94, 0.25)',
      }
    },
  },
  plugins: [],
}
