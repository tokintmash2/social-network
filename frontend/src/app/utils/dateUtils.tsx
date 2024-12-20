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

export const formatDateTime = (isoDateTime: string) => {
	// Parse the ISO datetime string
	const date = new Date(isoDateTime)

	// Extract parts of the date
	const day = String(date.getDate()).padStart(2, '0') // dd
	const month = String(date.getMonth() + 1).padStart(2, '0') // mm
	const year = date.getFullYear() // yyyy
	const hours = String(date.getHours()).padStart(2, '0') // hh
	const minutes = String(date.getMinutes()).padStart(2, '0') // mm

	// Format into "dd.mm.yyyy hh:mm"
	return `${day}.${month}.${year} ${hours}:${minutes}`
}
