import { createContext, Dispatch, SetStateAction, useState } from "react";

interface Result {
	id: number;
	display_name: string;
}

export interface Meta {
	count: number;
	db_response_time_ms: number;
	page: number;
	per_page: number;
}

type SearchResult<T extends Result = Result> = {
	meta: Meta;
	results: T[];
};

interface AppContextType {
	searchResults: SearchResult[];
	setSearchResults: Dispatch<SetStateAction<SearchResult[]>>;
	collections: any[];
	setCollections: Dispatch<SetStateAction<any[]>>;
	activeCollectionId: string;
	setActiveCollectionId: Dispatch<SetStateAction<string>>;
	searchWhileTyping: boolean;
	setSearchWhileTyping: Dispatch<SetStateAction<boolean>>;
}

const defaultContext: AppContextType = {
	searchResults: [],
	setSearchResults: () => {},
	collections: [],
	setCollections: () => {},
	activeCollectionId: "",
	setActiveCollectionId: () => {},
	searchWhileTyping: false,
	setSearchWhileTyping: () => {},
};

export const AppContext = createContext<AppContextType>(defaultContext);

export function AppContextProvider({
	children,
}: {
	children: React.ReactNode;
}): JSX.Element {
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [collections, setCollections] = useState<any[]>([]);
	const [activeCollectionId, setActiveCollectionId] = useState<string>("");
	const [searchWhileTyping, setSearchWhileTyping] = useState<boolean>(false);

	const context = {
		searchResults,
		setSearchResults,
		collections,
		setCollections,
		activeCollectionId,
		setActiveCollectionId,
		searchWhileTyping,
		setSearchWhileTyping,
	};

	return (
		<AppContext.Provider value={context}>{children}</AppContext.Provider>
	);
}

import { useContext } from "react";
import "./App.css";

function App(): JSX.Element {
	return (
		<AppContextProvider>
			<SearchBar />
			<SearchResults />
		</AppContextProvider>
	);
}

export default App;

import { useEffect } from "react";

function SearchBar(): JSX.Element {
	const { searchWhileTyping, setSearchWhileTyping, setSearchResults } =
		useContext(AppContext);
	const [query, setQuery] = useState("");
	const [entityType, setEntityType] = useState("all");

	const performSearch = () => {
		const filteredResults = [
			{ id: 1, display_name: "John Doe", type: "person" },
			{ id: 2, display_name: "Acme Corp", type: "organization" },
			{ id: 3, display_name: "New York City", type: "location" },
		].filter(
			(result) =>
				(entityType === "all" || result.type === entityType) &&
				result.display_name.toLowerCase().includes(query.toLowerCase())
		);

		const dummyResults: SearchResult = {
			meta: {
				count: filteredResults.length,
				db_response_time_ms: 0,
				page: 1,
				per_page: filteredResults.length,
			},
			results: filteredResults,
		};

		setSearchResults([dummyResults]);
	};

	useEffect(() => {
		if (searchWhileTyping) {
			performSearch();
		}
	}, [query, entityType, searchWhileTyping]);

	return (
		<div className="search-bar">
			<input
				type="text"
				placeholder="Search for entities..."
				value={query}
				onChange={(e) => setQuery(e.target.value)}
			/>
			<select
				value={entityType}
				onChange={(e) => setEntityType(e.target.value)}
			>
				<option value="all">All</option>
				<option value="person">Person</option>
				<option value="organization">Organization</option>
				<option value="location">Location</option>
			</select>

			<label>
				<input
					type="checkbox"
					checked={searchWhileTyping}
					onChange={(e) => setSearchWhileTyping(e.target.checked)}
				/>
				Search while typing
			</label>
			<button onClick={performSearch}>Search</button>
		</div>
	);
}

function SearchResults(): JSX.Element {
	const { searchResults } = useContext(AppContext);

	return (
		<div className="search-results">
			{searchResults.length > 0 ? (
				searchResults[0]?.results.map((result) => (
					<div key={result.id} className="search-result">
						<h3>{result.display_name}</h3>
					</div>
				))
			) : (
				<p>No results found.</p>
			)}
		</div>
	);
}
