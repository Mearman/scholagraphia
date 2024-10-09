import { durationToMilliseconds } from "./openAlex";

export const fetchWithCache: typeof fetch = async (
	url: RequestInfo | URL,
	options?: RequestInit | undefined
): Promise<Response> => {
	if (typeof url === "string") {
		url = new URL(url);
	}
	const cacheKey = [url.toString(), JSON.stringify(options)]
		.filter(Boolean)
		.join("_");
	const cachedData = getFromCache(cacheKey);

	if (cachedData) {
		return cachedData;
	}

	const response = await fetch(url.toString(), options);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	await setToCache(cacheKey, response.clone());
	return response;
};

interface CacheItem {
	data: {
		bodyText: string;
		status: number;
		statusText: string;
		headers: Record<string, string>;
	};
	timestamp: number;
}

async function setToCache(key: string, response: Response): Promise<Response> {
	const clonedResponse = response.clone();
	const bodyText = await clonedResponse.text();

	const headers: Record<string, string> = {};
	clonedResponse.headers.forEach((value, key) => {
		headers[key] = value;
	});

	const data = {
		bodyText,
		status: clonedResponse.status,
		statusText: clonedResponse.statusText,
		headers,
	};

	const cacheItem: CacheItem = {
		data,
		timestamp: Date.now(),
	};

	localStorage.setItem(key, JSON.stringify(cacheItem));

	return response;
}

function getFromCache(key: string): Response | null {
	const item = localStorage.getItem(key);
	if (!item) return null;

	const { data, timestamp }: CacheItem = JSON.parse(item);
	const timeSinceCached = Date.now() - timestamp;

	if (timeSinceCached > CACHE_EXPIRATION) {
		localStorage.removeItem(key);
		return null;
	}

	const headers = new Headers(data.headers);

	const responseInit: ResponseInit = {
		status: data.status,
		statusText: data.statusText,
		headers,
	};
	return new Response(data.bodyText, responseInit);
}

const CACHE_EXPIRATION = durationToMilliseconds({ weeks: 1 });
