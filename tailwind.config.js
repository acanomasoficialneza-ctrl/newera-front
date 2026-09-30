/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'newera-bg-dark': '#000000',      // Ultra deep black for background
        'newera-bg-card': '#111111',      // Sleek dark grey for panels
        'newera-primary': '#2563EB',      // Electric blue for primary actions
        'newera-accent': '#F5A623',       // Amber/Gold for premium details
        'newera-profit': '#10B981',       // Professional Emerald for gains
        'newera-loss': '#EF4444',         // Professional Ruby for losses
        'newera-text-main': '#FAFAFA',    // Pure white text
        'newera-text-muted': '#A1A1AA'    // Zinc muted text
      },
      backgroundImage: {
        'gradient-premium': 'radial-gradient(circle at top left, rgba(37,99,235,0.1) 0%, rgba(0,0,0,1) 50%)',
      }
    },
  },
  plugins: [],
}
