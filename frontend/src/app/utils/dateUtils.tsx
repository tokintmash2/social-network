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

export function formatLongDate(date: string | Date) {
	// Use a stable date format that will be consistent between server and client
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	}).format(new Date(date))
}
