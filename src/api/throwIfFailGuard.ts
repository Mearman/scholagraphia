export function throwIfFailGuard<T>(
	value: T,
	guard: (value: T) => boolean,
	message: string
): asserts value is T {
	if (!guard(value)) {
		throw new Error(message);
	}
}
