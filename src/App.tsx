import { createContext, Dispatch, SetStateAction, useState } from "react";

interface SearchResult {
	id: number;
	name: string;
	type: string;
}

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

// SearchBar.tsx
import { useEffect } from "react";
import "./App.css";

function SearchBar(): JSX.Element {
	const { searchWhileTyping, setSearchWhileTyping, setSearchResults } =
		useContext(AppContext);
	const [query, setQuery] = useState("");
	const [entityType, setEntityType] = useState("all");

	const performSearch = () => {
		const dummyResults = [
			{ id: 1, name: "John Doe", type: "person" },
			{ id: 2, name: "Acme Corp", type: "organization" },
			{ id: 3, name: "New York City", type: "location" },
		].filter(
			(result) =>
				(entityType === "all" || result.type === entityType) &&
				result.name.toLowerCase().includes(query.toLowerCase())
		);
		setSearchResults(dummyResults);
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
				searchResults.map((result) => (
					<div key={result.id} className="search-result">
						<h3>{result.name}</h3>
						<p>Type: {result.type}</p>
					</div>
				))
			) : (
				<p>No results found.</p>
			)}
		</div>
	);
}
