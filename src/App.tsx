// AppContext.tsx

import {
	Dispatch,
	SetStateAction,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

interface Result {
	id: string;
	display_name: string;
	relevance_score: number;
}

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
	resortOnLoad: boolean;
	setResortOnLoad: Dispatch<SetStateAction<boolean>>;
	cacheExpiry: number;
	setCacheExpiry: Dispatch<SetStateAction<number>>;
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
	resortOnLoad: false,
	setResortOnLoad: () => {},
	cacheExpiry: 3600000, // Default expiry time is 1 hour
	setCacheExpiry: () => {},
};

export function secondsToMilliseconds(seconds: number) {
	return seconds * 1000;
}
export function minutesToMilliseconds(minutes: number) {
	return secondsToMilliseconds(minutes * 60);
}
export function hoursToMilliseconds(hours: number) {
	return minutesToMilliseconds(hours * 60);
}
export function daysToMilliseconds(days: number) {
	return hoursToMilliseconds(days * 24);
}
export function weeksToMilliseconds(weeks: number) {
	return daysToMilliseconds(weeks * 7);
}
export function monthsToMilliseconds(months: number, daysInMonth = 30) {
	return daysToMilliseconds(months * daysInMonth);
}
export function yearsToMilliseconds(years: number) {
	return daysToMilliseconds(years * 365);
}

export function durationToMilliseconds({
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

export const AppContext = createContext<AppContextType>(defaultContext);

export function AppContextProvider({
	children,
}: {
	children: React.ReactNode;
}): JSX.Element {
	const [searchResults, setSearchResults] = useState<Result[]>([]);
	const [query, setQuery] = useState("");
	const [entityType, setEntityType] = useState("all");
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(10);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [noMoreResults, setNoMoreResults] = useState<boolean>(false);
	const [searchWhileTyping, setSearchWhileTyping] = useState<boolean>(false);
	const [resortOnLoad, setResortOnLoad] = useState<boolean>(false);
	const [cacheExpiry, setCacheExpiry] = useState<number>(
		durationToMilliseconds({ weeks: 1 })
	);

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

		// Build cache key
		const cacheKey = `searchResults:${encodeURIComponent(
			query
		)}:${entityType}:${page}:${perPage}`;

		// Try to get from cache
		const cachedData = localStorage.getItem(cacheKey);
		if (cachedData) {
			const cacheEntry: { timestamp: number; data: Result[] } =
				JSON.parse(cachedData);
			const now = Date.now();
			if (now - cacheEntry.timestamp < cacheExpiry) {
				// Cache entry is valid
				setSearchResults((prevResults) => {
					const updatedResults = [...prevResults, ...cacheEntry.data];
					if (resortOnLoad) {
						updatedResults.sort(
							(a, b) => b.relevance_score - a.relevance_score
						);
					}
					return updatedResults;
				});
				setIsLoading(false);
				return;
			} else {
				// Cache entry is expired
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

			// Cache the results
			const cacheEntry = {
				timestamp: Date.now(),
				data: combinedResults,
			};
			localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));

			setSearchResults((prevResults) => {
				const updatedResults = [...prevResults, ...combinedResults];
				if (resortOnLoad) {
					updatedResults.sort(
						(a, b) => b.relevance_score - a.relevance_score
					);
				}
				return updatedResults;
			});
		} catch (error) {
			console.error("Error fetching search results:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const context = {
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
		resortOnLoad,
		setResortOnLoad,
		cacheExpiry,
		setCacheExpiry,
	};

	return (
		<AppContext.Provider value={context}>{children}</AppContext.Provider>
	);
}

function App(): JSX.Element {
	return (
		<AppContextProvider>
			<SearchBar />
			<SearchResults />
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
		resortOnLoad,
		setResortOnLoad,
		cacheExpiry,
		setCacheExpiry,
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

	useEffect(() => {
		if (searchWhileTyping) {
			setCurrentPage(1);
			setSearchResults([]);
			performSearch(1);
		}
	}, [query, entityType, searchWhileTyping]);

	return (
		<div className="search-bar">
			<input
				type="text"
				placeholder="Search for entities..."
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				onKeyDown={handleKeyDown} // Added event handler for Enter key
			/>
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
					checked={resortOnLoad}
					onChange={(e) => setResortOnLoad(e.target.checked)}
				/>
				Resort results when new page is loaded
			</label>
			<select
				value={perPage}
				onChange={(e) => setPerPage(Number(e.target.value))}
			>
				<option value={10}>10 per page</option>
				<option value={20}>20 per page</option>
				<option value={50}>50 per page</option>
				<option value={100}>100 per page</option>
			</select>

			<label>
				Cache Expiry (minutes):
				<input
					type="number"
					min="0"
					value={cacheExpiry / 60000} // Convert ms to minutes
					onChange={(e) =>
						setCacheExpiry(Number(e.target.value) * 60000)
					} // Convert minutes to ms
				/>
			</label>

			<button onClick={handleSearch}>Search</button>
		</div>
	);
}

// SearchResults.tsx

function SearchResults(): JSX.Element {
	const {
		searchResults,
		currentPage,
		setCurrentPage,
		isLoading,
		performSearch,
		noMoreResults,
	} = useContext(AppContext);

	useEffect(() => {
		const handleScroll = () => {
			if (
				window.innerHeight + window.scrollY >=
					document.documentElement.scrollHeight - 500 &&
				!isLoading &&
				!noMoreResults
			) {
				// Load more results
				const nextPage = currentPage + 1;
				setCurrentPage(nextPage);
				performSearch(nextPage);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [currentPage, isLoading, noMoreResults, performSearch]);

	if (searchResults.length === 0) {
		return <p>No results found.</p>;
	}

	return (
		<div className="search-results">
			{searchResults.map((result) => (
				<div key={result.id} className="search-result">
					<h3>{result.display_name}</h3>
					<p>Relevance Score: {result.relevance_score.toFixed(2)}</p>
					<p>Entity Type: {getEntityTypeFromId(result.id)}</p>
				</div>
			))}
			{isLoading && <p>Loading more results...</p>}
			{noMoreResults && <p>No more results.</p>}
		</div>
	);
}

function getEntityTypeFromId(id: string): string {
	const prefix = id.split("/").pop()?.charAt(0); // Get the character after the last slash
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
