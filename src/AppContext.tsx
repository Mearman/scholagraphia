import {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useEffect,
	useState,
} from "react";
import { EntityType, Result, ThemeMode, ViewMode } from "./types";
import { durationToMilliseconds } from "./util/time";

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
	searchWhileTyping: false,
	setSearchWhileTyping: () => {},
	sortOnLoad: false,
	setSortOnLoad: () => {},
	cacheExpiryMs: durationToMilliseconds({ weeks: 1 }),
	setCacheExpiry: () => {},
	viewMode: "grid",
	setViewMode: () => {},
	theme: "auto",
	setTheme: () => {},
};
export const AppContext = createContext<AppContextType>(defaultContext);

export function AppContextProvider({
	children,
}: {
	children: ReactNode;
}): JSX.Element {
	const [searchResults, setSearchResults] = useState<Result[]>([]);
	const [query, setQuery] = useState("");
	const [entityType, setEntityType] = useState(defaultContext.entityType);
	const [currentPage, setCurrentPage] = useState(defaultContext.currentPage);
	const [perPage, setPerPage] = useState(defaultContext.perPage);
	const [isLoading, setIsLoading] = useState(defaultContext.isLoading);
	const [noMoreResults, setNoMoreResults] = useState(
		defaultContext.noMoreResults
	);
	const [searchWhileTyping, setSearchWhileTyping] = useState(
		defaultContext.searchWhileTyping
	);
	const [sortOnLoad, setSortOnLoad] = useState(defaultContext.sortOnLoad);
	const [cacheExpiryMs, setCacheExpiry] = useState(
		defaultContext.cacheExpiryMs
	);
	const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.grid);
	const [theme, setTheme] = useState<ThemeMode>(ThemeMode.auto);

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
	}, [theme]);

	const performSearch = async (page = currentPage) => {
		if (!query || isLoading || noMoreResults) return;

		setIsLoading(true);

		if (page === 1) {
			setNoMoreResults(false);
		}

		const entityTypes =
			entityType === "all" ? Object.values(EntityType) : [entityType];

		const cacheKey = `searchResults:${encodeURIComponent(
			query
		)}:${entityType}:${page}:${perPage}`;

		const cachedData = localStorage.getItem(cacheKey);
		if (cachedData) {
			const cacheEntry: { timestamp: number; data: Result[] } =
				JSON.parse(cachedData);
			const now = Date.now();
			if (now - cacheEntry.timestamp < cacheExpiryMs) {
				setSearchResults((prevResults) => {
					const updatedResults = [...prevResults, ...cacheEntry.data];
					return sortOnLoad
						? updatedResults.sort(
								(a, b) => b.relevance_score - a.relevance_score
						  )
						: updatedResults;
				});
				setIsLoading(false);
				return;
			} else {
				localStorage.removeItem(cacheKey);
			}
		}

		try {
			const fetchPromises = entityTypes.map(async (type) => {
				const url = `https://api.openalex.org/${type}?search=${encodeURIComponent(
					query
				)}&page=${page}&per_page=${perPage}`;

				const response = await fetch(url);
				const data = await response.json();

				return data.results.map((result: any) => ({
					id: result.id,
					display_name: result.display_name,
					relevance_score: result.relevance_score || 0,
				}));
			});

			const resultsArrays = await Promise.all(fetchPromises);
			const combinedResults = resultsArrays.flat();

			if (combinedResults.length === 0) {
				setNoMoreResults(true);
			}

			const cacheEntry = {
				timestamp: Date.now(),
				data: combinedResults,
			};
			localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));

			setSearchResults((prevResults) => {
				const updatedResults = [...prevResults, ...combinedResults];
				return sortOnLoad
					? updatedResults.sort((a, b) => b.relevance_score - a.relevance_score)
					: updatedResults;
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
	};

	return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
}
