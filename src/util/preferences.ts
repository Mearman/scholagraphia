export function getPreference<T>(key: string, defaultValue: T): T {
	const storedValue = localStorage.getItem(key);
	const parsedValue = storedValue ? JSON.parse(storedValue) : defaultValue;
	if (parsedValue) {
		console.debug(`Retrieved ${key}: ${parsedValue}`);
	}
	return parsedValue;
}

export function setPreference<T>(key: string, value: T): void {
	console.debug(`Setting ${key}: ${value}`);
	localStorage.setItem(key, JSON.stringify(value));
}
