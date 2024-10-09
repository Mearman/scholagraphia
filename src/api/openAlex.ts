import {
	EntityMetadata,
	EntityType,
	entityTypeMappings,
	SearchResult,
} from "../types";

const BASE_URL = "https://api.openalex.org";
const CACHE_EXPIRATION = 30 * 60 * 1000; // 30 minutes in milliseconds

interface CacheItem {
	data: any;
	timestamp: number;
}

const getFromCache = (key: string): any | null => {
	const item = localStorage.getItem(key);
	if (!item) return null;

	const { data, timestamp }: CacheItem = JSON.parse(item);
	const timeSinceCached = Date.now() - timestamp;

	console.debug({ cache: JSON.parse(item) });

	if (timeSinceCached > CACHE_EXPIRATION) {
		console.debug(`Cache expired for key: ${key}`);
		localStorage.removeItem(key);
		return null;
	}

	return data;
};

const setToCache = (key: string, data: any) => {
	const item: CacheItem = { data, timestamp: Date.now() };
	localStorage.setItem(key, JSON.stringify(item));
};

const fetchWithCache = async (url: string, options?: RequestInit) => {
	const cacheKey = `openalex_cache_${url}`;
	const cachedData = getFromCache(cacheKey);

	if (cachedData) {
		return cachedData;
	}

	const response = await fetch(url, options);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const data = await response.json();
	setToCache(cacheKey, data);
	return data;
};

export const searchEntities = async (
	query: string,
	type: string = "all"
): Promise<SearchResult[]> => {
	let endpoint = `${BASE_URL}/autocomplete`;

	if (type !== "all") {
		endpoint += `/${type}`;
	}

	endpoint += `?q=${encodeURIComponent(query)}`;

	try {
		const data = await fetchWithCache(endpoint);
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
};

export const getEntityDetails = async (
	id: string
): Promise<Record<string, unknown>> => {
	try {
		const endpoint = apiUrlForUri(id);

		console.log(`Fetching entity details from: ${endpoint}`);

		const data = await fetchWithCache(endpoint);
		return data;
	} catch (error) {
		console.error(`Error fetching entity details for ${id}:`, error);
		throw error;
	}
};

export const getRelatedEntities = async (
	id: string
): Promise<SearchResult[]> => {
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
};

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
		)?.ENTITY_TYPE || "unknown"
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
