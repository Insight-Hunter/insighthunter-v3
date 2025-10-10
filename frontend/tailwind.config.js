// frontend/tailwind.config.js
// Configuration for Tailwind CSS styling

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // You can add custom colors for your brand here
        'brand-blue': '#3b82f6',
        'brand-purple': '#8b5cf6'
      }
    }
  },
  plugins: []
};
