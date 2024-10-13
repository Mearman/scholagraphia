export function getPreference<T>(key: string, defaultValue: T): T {
	const storedValue = localStorage.getItem(key);
	let parsedValue: T;

	if (storedValue === null) {
		parsedValue = defaultValue;
	} else {
		try {
			parsedValue = JSON.parse(storedValue);
		} catch (error) {
			console.warn(`Failed to parse stored value for ${key}, using as-is:`, storedValue);
			parsedValue = storedValue as T;
		}
	}

	if (parsedValue !== undefined) {
		console.debug(`Retrieved ${key}:`, parsedValue);
	}
	return parsedValue;
}

export function setPreference<T>(key: string, value: T): void {
	console.debug(`Setting ${key}:`, value);
	localStorage.setItem(key, JSON.stringify(value));
}
