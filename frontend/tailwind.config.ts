import type { Config } from 'tailwindcss'
import daisyui from 'daisyui'

const config: Config = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				background: 'var(--background)',
				foreground: 'var(--foreground)',
			},
			maxWidth: {
				'128': '32rem',
			},
			fontFamily: {
				krona: ['Krona One', 'sans-serif'],
			},
		},
		
	},
	plugins: [daisyui],
	daisyui: {
		themes: ['light', 'dark'],
	},
}

export default config
