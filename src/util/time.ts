function secondsToMilliseconds(seconds: number): number {
	return seconds * 1000;
}

function minutesToMilliseconds(minutes: number): number {
	return secondsToMilliseconds(minutes * 60);
}

function hoursToMilliseconds(hours: number): number {
	return minutesToMilliseconds(hours * 60);
}

function daysToMilliseconds(days: number): number {
	return hoursToMilliseconds(days * 24);
}

function weeksToMilliseconds(weeks: number): number {
	return daysToMilliseconds(weeks * 7);
}

function monthsToMilliseconds(months: number, daysInMonth = 30): number {
	return daysToMilliseconds(months * daysInMonth);
}

function yearsToMilliseconds(years: number): number {
	return daysToMilliseconds(years * 365);
}

type TimeInterval = {
	seconds?: number;
	minutes?: number;
	hours?: number;
	days?: number;
	weeks?: number;
	months?: number;
	years?: number;
};

/**
 * Converts a given time interval into milliseconds.
 *
 * @param {Object} timeInterval - The time interval to convert.
 * @param {number} [timeInterval.seconds=0] - The number of seconds.
 * @param {number} [timeInterval.minutes=0] - The number of minutes.
 * @param {number} [timeInterval.hours=0] - The number of hours.
 * @param {number} [timeInterval.days=0] - The number of days.
 * @param {number} [timeInterval.weeks=0] - The number of weeks.
 * @param {number} [timeInterval.months=0] - The number of months.
 * @param {number} [timeInterval.years=0] - The number of years.
 * @returns {number} The total time interval in milliseconds.
 */
export function durationToMilliseconds({
																				 seconds = 0,
																				 minutes = 0,
																				 hours = 0,
																				 days = 0,
																				 weeks = 0,
																				 months = 0,
																				 years = 0,
																			 }: TimeInterval): number {
	return (
		secondsToMilliseconds(seconds) +
		minutesToMilliseconds(minutes) +
		hoursToMilliseconds(hours) +
		daysToMilliseconds(days) +
		weeksToMilliseconds(weeks) +
		monthsToMilliseconds(months) +
		yearsToMilliseconds(years)
	);
}

/**
 * Converts a given duration in milliseconds to a TimeInterval object.
 * The TimeInterval object contains the duration broken down into years, months, weeks, days, hours, minutes, and seconds.
 *
 * @param {number} ms - The duration in milliseconds to be converted.
 * @returns {TimeInterval} An object representing the duration in years, months, weeks, days, hours, minutes, and seconds.
 */
function msToDuration(ms: number): TimeInterval {
	if (ms >= yearsToMilliseconds(1)) {
		const years = Math.floor(ms / yearsToMilliseconds(1));
		return {years, ...msToDuration(ms % yearsToMilliseconds(1))};
	} else if (ms >= monthsToMilliseconds(1)) {
		const months = Math.floor(ms / monthsToMilliseconds(1));
		return {months, ...msToDuration(ms % monthsToMilliseconds(1))};
	} else if (ms >= weeksToMilliseconds(1)) {
		const weeks = Math.floor(ms / weeksToMilliseconds(1));
		return {weeks, ...msToDuration(ms % weeksToMilliseconds(1))};
	} else if (ms >= daysToMilliseconds(1)) {
		const days = Math.floor(ms / daysToMilliseconds(1));
		return {days, ...msToDuration(ms % daysToMilliseconds(1))};
	} else if (ms >= hoursToMilliseconds(1)) {
		const hours = Math.floor(ms / hoursToMilliseconds(1));
		return {hours, ...msToDuration(ms % hoursToMilliseconds(1))};
	} else if (ms >= minutesToMilliseconds(1)) {
		const minutes = Math.floor(ms / minutesToMilliseconds(1));
		return {minutes, ...msToDuration(ms % minutesToMilliseconds(1))};
	} else if (ms >= secondsToMilliseconds(1)) {
		const seconds = Math.floor(ms / secondsToMilliseconds(1));
		return {seconds, ...msToDuration(ms % secondsToMilliseconds(1))};
	} else {
		return {};
	}
}

/**
 * Converts a `TimeInterval` object to a human-readable string.
 *
 * @param duration - An object representing a time interval, where keys are time units (e.g., "seconds", "minutes") and values are the corresponding amounts.
 * @returns A string representation of the time interval, excluding units with a value of 0.
 */
function durationToString(duration: TimeInterval): string {
	const parts = Object.entries(duration)
		.map(([unit, value]) => `${value} ${unit}`)
		.filter((part) => part !== "0 seconds");
	return parts.join(", ");
}
