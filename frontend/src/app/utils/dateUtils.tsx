export function formatDate(date: Date | string) {
	const dateObject = date instanceof Date ? date : new Date(date)
	return dateObject
		.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		})
		.replace(/\//g, '.') // Replace slashes with dots
}
