import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    // 主题颜色渐变类 - 必须静态声明以便 Tailwind 编译
    'bg-gradient-to-br',
    // zinc theme
    'from-zinc-800', 'via-zinc-900', 'to-black',
    // blue theme
    'from-blue-500', 'via-indigo-600', 'to-violet-800',
    // rose theme
    'from-rose-400', 'via-pink-600', 'to-rose-900',
    // amber theme
    'from-amber-300', 'via-orange-500', 'to-red-600',
    // emerald theme
    'from-emerald-400', 'via-teal-600', 'to-cyan-800',
    // violet theme
    'from-violet-500', 'via-purple-600', 'to-fuchsia-900',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
