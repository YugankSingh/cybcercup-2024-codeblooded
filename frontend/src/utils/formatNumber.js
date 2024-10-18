export default function numberFormatter(number) {
	const formatter = new Intl.NumberFormat('en-IN', {
		notation: 'compact'
	})
	return formatter.format(number)
}