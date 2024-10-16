import { openDB } from "idb";
import { Context, createContext, Dispatch, ReactElement, ReactNode, SetStateAction, useEffect, useState } from "react";
import { EntityEndpointPath, Result, ThemeMode, ViewMode } from "./types";
import { getPreference, setPreference } from "./util/preferences.ts";
import { durationToMilliseconds, msToString } from "./util/time";

export interface AppContextType {
	searchResults: Result[];
	setSearchResults: Dispatch<SetStateAction<Result[]>>;
	query: string;
	setQuery: Dispatch<SetStateAction<string>>;
	entityType: string;
	setEntityType: Dispatch<SetStateAction<string>>;
	currentPage: number;
	setCurrentPage: Dispatch<SetStateAction<number>>;
	perPage: number;
	setPerPage: Dispatch<SetStateAction<number>>;
	isLoading: boolean;
	setIsLoading: Dispatch<SetStateAction<boolean>>;
	noMoreResults: boolean;
	setNoMoreResults: Dispatch<SetStateAction<boolean>>;
	performSearch: (page?: number) => Promise<void>;
	searchWhileTyping: boolean;
	setSearchWhileTyping: Dispatch<SetStateAction<boolean>>;
	sortOnLoad: boolean;
	setSortOnLoad: Dispatch<SetStateAction<boolean>>;
	cacheExpiryMs: number;
	setCacheExpiry: Dispatch<SetStateAction<number>>;
	viewMode: ViewMode;
	setViewMode: Dispatch<SetStateAction<ViewMode>>;
	theme: ThemeMode;
	setTheme: Dispatch<SetStateAction<ThemeMode>>;
	fetchWithCache: typeof fetch
}

const defaultContext: AppContextType = {
	searchResults: [],
	setSearchResults: () => {},
	query: "",
	setQuery: () => {},
	entityType: "all",
	setEntityType: () => {},
	currentPage: 1,
	setCurrentPage: () => {},
	perPage: 10,
	setPerPage: () => {},
	isLoading: false,
	setIsLoading: () => {},
	noMoreResults: false,
	setNoMoreResults: () => {},
	performSearch: async () => {},
	searchWhileTyping: getPreference<boolean>("searchWhileTyping", true),
	setSearchWhileTyping: () => {},
	sortOnLoad: getPreference("sortOnLoad", true),
	setSortOnLoad: () => {},
	cacheExpiryMs: durationToMilliseconds({ weeks: 1 }),
	setCacheExpiry: () => {},
	viewMode: getPreference<ViewMode>("viewMode", ViewMode.grid),
	setViewMode: () => {},
	theme: getPreference<ThemeMode>("theme", ThemeMode.auto),
	setTheme: () => {},
	fetchWithCache: fetch,
};

export const AppContext: Context<AppContextType> = createContext<AppContextType>(defaultContext);

export function AppContextProvider({ children }: { children: ReactNode }): ReactElement {
	const [searchResults, setSearchResults] = useState<Result[]>([]);
	const [query, setQuery] = useState("");
	const [entityType, setEntityType] = useState(defaultContext.entityType);
	const [currentPage, setCurrentPage] = useState(defaultContext.currentPage);
	const [perPage, setPerPage] = useState(defaultContext.perPage);
	const [isLoading, setIsLoading] = useState(defaultContext.isLoading);
	const [noMoreResults, setNoMoreResults] = useState(defaultContext.noMoreResults);
	const [searchWhileTyping, setSearchWhileTyping] = useState<boolean>(defaultContext.searchWhileTyping);
	const [sortOnLoad, setSortOnLoad] = useState<boolean>(defaultContext.sortOnLoad);
	const [cacheExpiryMs, setCacheExpiry] = useState(defaultContext.cacheExpiryMs);
	const [viewMode, setViewMode] = useState<ViewMode>(defaultContext.viewMode);
	const [theme, setTheme] = useState<ThemeMode>(defaultContext.theme);

	useEffect(() => {
		const savedTheme = getPreference<ThemeMode>("theme", ThemeMode.auto);
		setTheme(savedTheme);
	}, []);

	useEffect(() => {
		setPreference("theme", theme);
		document.documentElement.setAttribute("data-theme", theme);
	}, [theme]);

	useEffect(() => {
		setPreference("searchWhileTyping", searchWhileTyping);
	}, [searchWhileTyping]);

	useEffect(() => {
		setPreference("sortOnLoad", sortOnLoad);
	}, [sortOnLoad]);

	useEffect(() => {
		setPreference("viewMode", viewMode);
	}, [viewMode]);

	const performSearch = async (page = currentPage) => {
		if (!query || isLoading || noMoreResults) return;

		setIsLoading(true);

		if (page === 1) {
			setNoMoreResults(false);
		}

		const entityTypes = entityType === "all" ? Object.values(EntityEndpointPath) : [entityType];

		try {
			const resultsArrays = [];

			const perEntityPerPage = perPage;
			// const perEntityPerPage = perPage / entityTypes.length;1

			for await (const type of entityTypes) {
				const url = new URL("https://api.openalex.org/" + type);
				url.searchParams.append("search", query);
				url.searchParams.append("page", page.toString());
				url.searchParams.append("per_page", perEntityPerPage.toString());
				url.searchParams.append("select", ["id", "display_name", "relevance_score"].join(","));

				const response = await fetchWithCache(url);
				const data = await response.json();

				const result = data.results.map((result: any) => ({
					id: result.id,
					display_name: result.display_name,
					relevance_score: result.relevance_score || 0,
				}));

				resultsArrays.push(result);
			}

			const combinedResults = resultsArrays.flat();

			if (combinedResults.length === 0) {
				setNoMoreResults(true);
			}

			setSearchResults((prevResults) => {
				const updatedResults = [...prevResults, ...combinedResults];
				return sortOnLoad ? updatedResults.sort((a, b) => b.relevance_score - a.relevance_score) : updatedResults;
			});
		} catch (error) {
			console.error("Error fetching search results:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const context: AppContextType = {
		searchResults,
		setSearchResults,
		query,
		setQuery,
		entityType,
		setEntityType,
		currentPage,
		setCurrentPage,
		perPage,
		setPerPage,
		isLoading,
		setIsLoading,
		noMoreResults,
		setNoMoreResults,
		performSearch,
		searchWhileTyping,
		setSearchWhileTyping,
		sortOnLoad,
		setSortOnLoad,
		cacheExpiryMs,
		setCacheExpiry,
		viewMode,
		setViewMode,
		theme,
		setTheme,
		fetchWithCache,
	};

	return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
}

const DB_NAME = "fetchCacheDB";
const STORE_NAME = "fetchCacheStore";

async function getDB() {
	return openDB(DB_NAME, 1, {
		upgrade(db) {
			db.createObjectStore(STORE_NAME, { keyPath: "key" });
		},
	});
}

export function computeCacheKey(arg1: RequestInfo | URL, arg2?: RequestInit | undefined): string {
	const url = arg1 instanceof URL ? arg1.href : arg1;
	const options = arg2 ? JSON.stringify(arg2) : "";
	return ["fetch", url, options].filter(Boolean).join(":");
}

export const fetchWithCache: typeof fetch = async (
	url: RequestInfo | URL,
	options?: RequestInit | undefined
): Promise<Response> => {
	if (typeof url === "string") {
		url = new URL(url);
	}

	const cacheKey = computeCacheKey(url, options);
	const cachedData = await getCache(cacheKey);

	if (cachedData !== null) {
		return cachedData;
	}

	const response = await fetch(url.toString(), options);
	if (!response.ok) {
		if (response.status === 429) {
			const retryAfter = response.headers.get("Retry-After");
			const delay = retryAfter ? parseInt(retryAfter) * 1000 : 1000;
			await new Promise((resolve) => setTimeout(resolve, delay));
			return fetchWithCache(url, options);
		}
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	await setCache(cacheKey, response.clone());
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

export async function setCache(key: string, response: Response): Promise<Response> {
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

	const db = await getDB();
	const tx = db.transaction(STORE_NAME, "readwrite");
	await tx.store.put({ key, ...cacheItem });
	await tx.done;

	return response;
}

export async function getCache(
	key: string,
	maxCacheAge: number = durationToMilliseconds({ weeks: 1 })
): Promise<Response | null> {
	const db = await getDB();
	const cacheItem = await db.get(STORE_NAME, key);
	if (!cacheItem) return null;

	const { data, timestamp }: CacheItem = cacheItem;
	const timeSinceCached = Date.now() - timestamp;

	const cacheAge = msToString(timeSinceCached);

	if (timeSinceCached > maxCacheAge) {
		console.debug(`Cache expired for ${key} (${cacheAge} old)`);
		const tx = db.transaction(STORE_NAME, "readwrite");
		await tx.store.delete(key);
		await tx.done;
		return null;
	}
	console.debug(`Cache hit for ${key} (${cacheAge} old)`);

	const headers = new Headers(data.headers);

	const responseInit: ResponseInit = {
		status: data.status,
		statusText: data.statusText,
		headers,
	};
	return new Response(data.bodyText, responseInit);
}
