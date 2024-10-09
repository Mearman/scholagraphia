import {
	EntityEndpointPath,
	EntityMetadata,
	EntityType,
	entityTypeMappings,
	Meta,
	SearchResult,
} from "../types";

const BASE_URL = "https://api.openalex.org";

const secondsToMilliseconds = (seconds: number) => seconds * 1000;
const minutesToMilliseconds = (minutes: number) =>
	secondsToMilliseconds(minutes * 60);
const hoursToMilliseconds = (hours: number) =>
	minutesToMilliseconds(hours * 60);
const daysToMilliseconds = (days: number) => hoursToMilliseconds(days * 24);
const weeksToMilliseconds = (weeks: number) => daysToMilliseconds(weeks * 7);
const monthsToMilliseconds = (months: number, daysInMonth = 30) =>
	daysToMilliseconds(months * daysInMonth);
const yearsToMilliseconds = (years: number) => daysToMilliseconds(years * 365);

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

function durationToMilliseconds({
	seconds = 0,
	minutes = 0,
	hours = 0,
	days = 0,
	weeks = 0,
	months = 0,
	years = 0,
}: {
	seconds?: number;
	minutes?: number;
	hours?: number;
	days?: number;
	weeks?: number;
	months?: number;
	years?: number;
}): number {
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

const CACHE_EXPIRATION = durationToMilliseconds({ weeks: 1 });

type FetchParams = Parameters<typeof fetch>;

export async function fetchPage<E, T extends { meta: Meta; results: E[] }>(
	url: URL | string,
	page: number = 1,
	perPage: number = 100,
	params?: Record<string, string>,
	options?: RequestInit
): Promise<T> {
	if (typeof url === "string") {
		url = new URL(url);
	}
	if (params) {
		Object.entries(params).forEach(([key, value]) => {
			url.searchParams.append(key, value);
		});
	}
	url.searchParams.append("page", page.toString());
	url.searchParams.append("per_page", perPage.toString());
	const data = await (await fetchWithCache(url.toString(), options)).json();
	return data.results;
}

export async function fetchAllPages<E, T extends { meta: Meta; results: E[] }>(
	url: URL,
	perPage: number = 100,
	params?: Record<string, string>,
	options?: RequestInit
): Promise<T> {
	let page = 1;
	let results: E[] = [];
	let data: T = await fetchPage(url, page, perPage, params, options);
	results = results.concat(data.results);

	let total_pages = Infinity;
	do {
		page++;
		data = await fetchPage(url, page, perPage, params, options);
		results = results.concat(data.results);
		total_pages = data.meta.count / data.meta.per_page;
	} while (data.meta.page < total_pages);

	return {
		...data,
		results,
	};
}

export async function searchEntities(
	search: string,
	type: EntityType | "all" = "all",
	params?: Record<string, string>,
	options?: RequestInit
): Promise<unknown[]> {
	let queryUrl = new URL(BASE_URL);

	let results: unknown[] = [];

	if (type == "all") {
		const endpoints = Object.values(EntityEndpointPath);
		for await (const endpoint of endpoints) {
			queryUrl.pathname = endpoint;
			queryUrl.searchParams.append("search", search);

			if (params) {
				Object.entries(params).forEach(([key, value]) => {
					queryUrl.searchParams.append(key, value);
				});
			}

			try {
				const data = await (await fetchWithCache(queryUrl.toString())).json();
				results.push(
					...data.results.map(
						(result: {
							id: string;
							display_name: string;
							entity_type: string;
						}) => ({
							id: result.id,
							display_name: result.display_name,
							// entity_type: type === "all" ? result.entity_type : type,
						})
					)
				);
			} catch (error) {
				console.error("Error fetching search results:", error);
				throw error;
			}
		}
	} else {
		queryUrl.pathname = EntityEndpointPath[type];
		queryUrl.searchParams.append("search", search);
		try {
			const data = await (
				await fetchWithCache(queryUrl.toString(), options)
			).json();
			return data.results.map(
				(result: {
					id: string;
					display_name: string;
					entity_type: string;
				}) => ({
					id: result.id,
					display_name: result.display_name,
					// entity_type: type === "all" ? result.entity_type : type,
				})
			);
		} catch (error) {
			console.error("Error fetching search results:", error);
			throw error;
		}
	}
	return results;
}

export async function autocompleteEntities(
	query: string,
	type: string = "all"
): Promise<SearchResult[]> {
	let endpoint = `${BASE_URL}/autocomplete`;

	if (type !== "all") {
		endpoint += `/${type}`;
	}

	endpoint += `?q=${encodeURIComponent(query)}`;

	try {
		const data = await (await fetchWithCache(endpoint)).json();
		return data.results.map(
			(result: { id: string; display_name: string; entity_type: string }) => ({
				id: result.id,
				display_name: result.display_name,
				entity_type: type === "all" ? result.entity_type : type,
			})
		);
	} catch (error) {
		console.error("Error fetching search results:", error);
		return [];
	}
}

export async function getEntityDetails(
	id: string
): Promise<Record<string, unknown>> {
	try {
		const endpoint = apiUrlForUri(id);

		console.log(`Fetching entity details from: ${endpoint}`);

		const data = await (await fetchWithCache(endpoint)).json();
		return data;
	} catch (error) {
		console.error(`Error fetching entity details for ${id}:`, error);
		throw error;
	}
}

export async function getRelatedEntities(id: string): Promise<SearchResult[]> {
	try {
		const entityDetails = await getEntityDetails(id);
		let relatedEntities: SearchResult[] = [];

		// Add authors
		if (entityDetails.authorships && Array.isArray(entityDetails.authorships)) {
			relatedEntities = relatedEntities.concat(
				entityDetails.authorships.map((authorship) => ({
					id: authorship.author.id,
					display_name: authorship.author.display_name,
					entity_type: "author",
				}))
			);
		}

		// Add concepts
		if (entityDetails.concepts && Array.isArray(entityDetails.concepts)) {
			relatedEntities = relatedEntities.concat(
				entityDetails.concepts.map((concept) => ({
					id: concept.id,
					display_name: concept.display_name,
					entity_type: "concept",
				}))
			);
		}

		// Add institutions
		if (
			entityDetails.institutions &&
			Array.isArray(entityDetails.institutions)
		) {
			relatedEntities = relatedEntities.concat(
				entityDetails.institutions.map((institution) => ({
					id: institution.id,
					display_name: institution.display_name,
					entity_type: "institution",
				}))
			);
		}

		return relatedEntities;
	} catch (error) {
		console.error("Error fetching related entities:", error);
		throw error;
	}
}

export const openAlexUriRegex: RegExp =
	/(?:https?:\/\/(?:openalex\.org|api\.openalex\.org)\/)?(?:[a-zA-Z]+\/)?([A-Za-z]\d{3,})(?:\/|\?|$)/;

export function idFromUri(uri: string): string {
	const match: RegExpMatchArray = openAlexUriRegex.exec(uri)!;
	if (match && match[1]) {
		return match[1].toUpperCase();
	}
	throw new Error(`Invalid OpenAlex URI: "${uri}"`);
}

export function typeFromUri(uri: string): EntityType | "unknown" {
	return (
		entityTypeMappings.find(
			(mapping) =>
				mapping.TYPE_CHAR.toUpperCase() ===
				idFromUri(uri).charAt(0).toUpperCase()
		)?.ENTITY_TYPE ?? "unknown"
	);
}

export function getEntityMetadataForUri(uri: string): EntityMetadata {
	const entityType = typeFromUri(uri);
	const metadata = entityTypeMappings.find(
		(mapping) => mapping.ENTITY_TYPE === entityType
	);
	if (!metadata) {
		throw new Error(`No metadata found for entity type: ${entityType}`);
	}
	return metadata;
}

export function apiUrlForUri(uri: string): string {
	const metadata = getEntityMetadataForUri(uri);
	return `${BASE_URL}/${metadata.ENTITY_ENDPOINT}/${idFromUri(uri)}`;
}
