
module.exports = {
  content: [
    
    "./src/**/*.{js,ts,jsx,tsx,mdx,html,css}",
   
    "./{pages,components,app,public,prisma,src}/**/*.{js,ts,jsx,tsx,mdx,html,css}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: ["dark"]
  }
};