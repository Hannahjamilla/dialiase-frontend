// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#395886', // 🩵 your custom color
        secondary: '#638ECB',
        green: '#477977',
        white: '#FFFF'
      },
    },
  },
  plugins: [],
}
