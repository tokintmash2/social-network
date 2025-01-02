module.exports = {
	images: {
        unoptimized: true,
		remotePatterns: [
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '8080',
			},
		],
	},
	// Disable this so react would not render twice,
	// see https://stackoverflow.com/a/61533127
	reactStrictMode: false,
}
