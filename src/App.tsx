import {
	createContext,
	Dispatch,
	SetStateAction,
	useContext,
	useEffect,
	useState,
} from "react";
import "./App.css";
import { durationToMilliseconds } from "./util/time";

interface Result {
	id: string;
	display_name: string;
	relevance_score: number;
}

const themeMode = {
	light: "light",
	dark: "dark",
	auto: "auto",
} as const;
type ThemeMode = (typeof themeMode)[keyof typeof themeMode];

const viewMode = {
	grid: "grid",
	list: "list",
} as const;
type ViewMode = (typeof viewMode)[keyof typeof viewMode];

interface AppContextType {
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

function AppContextProvider({
	children,
}: {
	children: React.ReactNode;
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
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");

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
			entityType === "all"
				? ["works", "concepts", "authors", "institutions", "sources"]
				: [entityType];

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

function App(): JSX.Element {
	return (
		<AppContextProvider>
			<div className="app-container">
				<header>
					<h1>Scholagraphia</h1>
				</header>
				<main>
					<SearchBar />
					<SearchResults />
				</main>
				<footer>
					<p>&copy; 2023 Scholagraphia. All rights reserved.</p>
				</footer>
			</div>
		</AppContextProvider>
	);
}

export default App;

function SearchBar(): JSX.Element {
	const {
		query,
		setQuery,
		entityType,
		setEntityType,
		perPage,
		setPerPage,
		setCurrentPage,
		setSearchResults,
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
	} = useContext(AppContext);

	const handleSearch = () => {
		setCurrentPage(1);
		setSearchResults([]);
		performSearch(1);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	const toggleTheme = () => {
		setTheme((prevTheme) => {
			if (prevTheme === "light") return "dark";
			if (prevTheme === "dark") return "auto";
			return "light";
		});
	};

	useEffect(() => {
		if (searchWhileTyping) {
			setCurrentPage(1);
			setSearchResults([]);
			performSearch(1);
		}
	}, [query, entityType, searchWhileTyping]);

	return (
		<div className="search-bar">
			<div className="search-input">
				<input
					type="text"
					placeholder="Search for entities..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={handleKeyDown}
				/>
				<button onClick={handleSearch}>Search</button>
			</div>
			<div className="search-options">
				<select
					value={entityType}
					onChange={(e) => setEntityType(e.target.value)}
				>
					<option value="works">Works</option>
					<option value="concepts">Concepts</option>
					<option value="authors">Authors</option>
					<option value="institutions">Institutions</option>
					<option value="sources">Sources</option>
					<option value="all">All</option>
				</select>
				<select
					value={perPage}
					onChange={(e) => setPerPage(Number(e.target.value))}
				>
					<option value={10}>10 per page</option>
					<option value={20}>20 per page</option>
					<option value={50}>50 per page</option>
					<option value={100}>100 per page</option>
				</select>
				<select
					value={viewMode}
					onChange={(e) => setViewMode(e.target.value as "grid" | "list")}
				>
					<option value="grid">Grid View</option>
					<option value="list">List View</option>
				</select>
				<button onClick={toggleTheme}>Toggle Theme</button>
			</div>
			<div className="search-settings">
				<label>
					<input
						type="checkbox"
						checked={searchWhileTyping}
						onChange={(e) => setSearchWhileTyping(e.target.checked)}
					/>
					Search while typing
				</label>
				<label>
					<input
						type="checkbox"
						checked={sortOnLoad}
						onChange={(e) => setSortOnLoad(e.target.checked)}
					/>
					Sort results when new page is loaded
				</label>
				<label>
					Cache Expiry (ms):
					<input
						type="number"
						min="0"
						value={cacheExpiryMs}
						onChange={(e) => setCacheExpiry(Number(e.target.value))}
					/>
				</label>
			</div>
		</div>
	);
}

function SearchResults(): JSX.Element {
	const {
		searchResults,
		currentPage,
		setCurrentPage,
		isLoading,
		performSearch,
		noMoreResults,
		viewMode,
	} = useContext(AppContext);

	useEffect(() => {
		const handleScroll = () => {
			if (
				window.innerHeight + window.scrollY >=
					document.documentElement.scrollHeight - 500 &&
				!isLoading &&
				!noMoreResults
			) {
				const nextPage = currentPage + 1;
				setCurrentPage(nextPage);
				performSearch(nextPage);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [currentPage, isLoading, noMoreResults, performSearch]);

	if (searchResults.length === 0) {
		return <p className="no-results">No results found.</p>;
	}

	return (
		<div className={`search-results ${viewMode}`}>
			{searchResults.map((result) => (
				<div key={result.id} className="search-result">
					<h3>{result.display_name}</h3>
					<p>Relevance Score: {result.relevance_score.toFixed(2)}</p>
					<p>Entity Type: {getEntityTypeFromId(result.id)}</p>
				</div>
			))}
			{isLoading && <p className="loading">Loading more results...</p>}
			{noMoreResults && <p className="no-more-results">No more results.</p>}
		</div>
	);
}

function getEntityTypeFromId(id: string): string {
	const prefix = id.split("/").pop()?.charAt(0);
	switch (prefix) {
		case "W":
			return "Work";
		case "C":
			return "Concept";
		case "A":
			return "Author";
		case "I":
			return "Institution";
		case "S":
			return "Source";
		default:
			return "Unknown";
	}
}
