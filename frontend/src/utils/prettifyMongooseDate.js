let format = function(date) {
	const secondsSince = Math.floor((new Date() - date) / 1000);
	const secPerDay = 86400;
	const secPerHour = 3600;
	const secPerMin = 60;

	// not in this year
	if (new Date().getFullYear() !== date.getFullYear()) {
		const monthOptions = {
			month: 'long',
			day: 'numeric',
			year: 'numeric'

		};

		const monthDay = date.toLocaleString('en-US', monthOptions);
		return `on ${monthDay}`;
	}



	// time is over a two days old
	if (secondsSince >= 2 * secPerDay) {
		const monthOptions = {
			month: 'long',
			day: 'numeric',
		};


		const monthDay = date.toLocaleString('en-US', monthOptions);
		return `on ${monthDay}`;
	}

	// time is over a day old
	if (secondsSince >= secPerDay) {
		return 'yesterday';
	}

	// time is over an hour old
	if (secondsSince >= secPerHour) {
		const hoursSince = Math.floor(secondsSince / secPerHour);
		return `${hoursSince} hr${hoursSince > 1 ? 's' : ''} ago`;
	}

	// time is over a minute old
	if (secondsSince >= secPerMin) {
		const minutesSince = Math.floor(secondsSince / secPerMin);
		return `${minutesSince} min${minutesSince > 1 ? 's' : ''} ago`;
	}

	// if it was posted in the last minute
	else {
		return 'just now';
	}
};
export default function prettifyMongooseTime(mongooseDate) {
	return format(new Date(mongooseDate))
}