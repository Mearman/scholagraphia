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
	sortOnLoad: boolean;
	setSortOnLoad: Dispatch<SetStateAction<boolean>>;
	cacheExpiryMs: number;
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
	sortOnLoad: false,
	setSortOnLoad: () => {},
	cacheExpiryMs: durationToMilliseconds({ weeks: 1 }),
	setCacheExpiry: () => {},
};

function secondsToMilliseconds(seconds: number): number {
	return seconds * 1000;
}
function minutesToMilliseconds(minutes: number): number {
	return secondsToMilliseconds(minutes * 60);
}
function hoursToMilliseconds(hours: number): number {
	return minutesToMilliseconds(hours * 60);
}
function daysToMilliseconds(days: number): number {
	return hoursToMilliseconds(days * 24);
}
function weeksToMilliseconds(weeks: number): number {
	return daysToMilliseconds(weeks * 7);
}
function monthsToMilliseconds(months: number, daysInMonth = 30): number {
	return daysToMilliseconds(months * daysInMonth);
}
function yearsToMilliseconds(years: number): number {
	return daysToMilliseconds(years * 365);
}

type TimeInterval = {
	seconds?: number;
	minutes?: number;
	hours?: number;
	days?: number;
	weeks?: number;
	months?: number;
	years?: number;
};

/**
 * Converts a given time interval into milliseconds.
 *
 * @param {Object} timeInterval - The time interval to convert.
 * @param {number} [timeInterval.seconds=0] - The number of seconds.
 * @param {number} [timeInterval.minutes=0] - The number of minutes.
 * @param {number} [timeInterval.hours=0] - The number of hours.
 * @param {number} [timeInterval.days=0] - The number of days.
 * @param {number} [timeInterval.weeks=0] - The number of weeks.
 * @param {number} [timeInterval.months=0] - The number of months.
 * @param {number} [timeInterval.years=0] - The number of years.
 * @returns {number} The total time interval in milliseconds.
 */
function durationToMilliseconds({
	seconds = 0,
	minutes = 0,
	hours = 0,
	days = 0,
	weeks = 0,
	months = 0,
	years = 0,
}: TimeInterval): number {
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

/**
 * Converts a given duration in milliseconds to a TimeInterval object.
 * The TimeInterval object contains the duration broken down into years, months, weeks, days, hours, minutes, and seconds.
 *
 * @param {number} ms - The duration in milliseconds to be converted.
 * @returns {TimeInterval} An object representing the duration in years, months, weeks, days, hours, minutes, and seconds.
 */
function msToDuration(ms: number): TimeInterval {
	if (ms >= yearsToMilliseconds(1)) {
		const years = Math.floor(ms / yearsToMilliseconds(1));
		return { years, ...msToDuration(ms % yearsToMilliseconds(1)) };
	} else if (ms >= monthsToMilliseconds(1)) {
		const months = Math.floor(ms / monthsToMilliseconds(1));
		return { months, ...msToDuration(ms % monthsToMilliseconds(1)) };
	} else if (ms >= weeksToMilliseconds(1)) {
		const weeks = Math.floor(ms / weeksToMilliseconds(1));
		return { weeks, ...msToDuration(ms % weeksToMilliseconds(1)) };
	} else if (ms >= daysToMilliseconds(1)) {
		const days = Math.floor(ms / daysToMilliseconds(1));
		return { days, ...msToDuration(ms % daysToMilliseconds(1)) };
	} else if (ms >= hoursToMilliseconds(1)) {
		const hours = Math.floor(ms / hoursToMilliseconds(1));
		return { hours, ...msToDuration(ms % hoursToMilliseconds(1)) };
	} else if (ms >= minutesToMilliseconds(1)) {
		const minutes = Math.floor(ms / minutesToMilliseconds(1));
		return { minutes, ...msToDuration(ms % minutesToMilliseconds(1)) };
	} else if (ms >= secondsToMilliseconds(1)) {
		const seconds = Math.floor(ms / secondsToMilliseconds(1));
		return { seconds, ...msToDuration(ms % secondsToMilliseconds(1)) };
	} else {
		return {};
	}
}

/**
 * Converts a `TimeInterval` object to a human-readable string.
 *
 * @param duration - An object representing a time interval, where keys are time units (e.g., "seconds", "minutes") and values are the corresponding amounts.
 * @returns A string representation of the time interval, excluding units with a value of 0.
 */
function durationToString(duration: TimeInterval): string {
	const parts = Object.entries(duration)
		.map(([unit, value]) => `${value} ${unit}`)
		.filter((part) => part !== "0 seconds");
	return parts.join(", ");
}

export const AppContext = createContext<AppContextType>(defaultContext);

function AppContextProvider({
	children,
}: {
	children: React.ReactNode;
}): JSX.Element {
	const [searchResults, setSearchResults] = useState<Result[]>([]);
	const [query, setQuery] = useState("");
	const [entityType, setEntityType] = useState(defaultContext.entityType);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(defaultContext.perPage);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [noMoreResults, setNoMoreResults] = useState<boolean>(false);
	const [searchWhileTyping, setSearchWhileTyping] = useState<boolean>(
		defaultContext.searchWhileTyping
	);
	const [sortOnLoad, setSortOnLoad] = useState<boolean>(
		defaultContext.sortOnLoad
	);
	const [cacheExpiryMs, setCacheExpiry] = useState<number>(
		defaultContext.cacheExpiryMs
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
			console.debug(`Cache hit for "${query}"`);
			const cacheEntry: { timestamp: number; data: Result[] } =
				JSON.parse(cachedData);
			const now = Date.now();
			const isCachedDataFresh = now - cacheEntry.timestamp < cacheExpiryMs;
			if (isCachedDataFresh) {
				// Cache entry is valid
				setSearchResults((prevResults) => {
					const updatedResults = [...prevResults, ...cacheEntry.data];
					if (sortOnLoad) {
						updatedResults.sort(
							(a, b) => b.relevance_score - a.relevance_score
						);
					}
					return updatedResults;
				});
				setIsLoading(false);
				return;
			} else {
				const expiredDuration = now - cacheEntry.timestamp;
				console.debug(
					`Cache entry for "${query}" expired ${durationToString(
						msToDuration(expiredDuration)
					)} ago`
				);

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
				if (sortOnLoad) {
					updatedResults.sort((a, b) => b.relevance_score - a.relevance_score);
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
		sortOnLoad,
		setSortOnLoad,
		cacheExpiryMs,
		setCacheExpiry,
	};

	return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
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
		sortOnLoad,
		setSortOnLoad,
		cacheExpiryMs,
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
					checked={sortOnLoad}
					onChange={(e) => setSortOnLoad(e.target.checked)}
				/>
				Sort results when new page is loaded
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
				Cache Expiry (ms):
				<input
					type="number"
					min="0"
					value={cacheExpiryMs}
					onChange={(e) => setCacheExpiry(Number(e.target.value))}
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
