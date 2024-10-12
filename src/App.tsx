import { createContext, Dispatch, SetStateAction, useState } from "react";
// AppContext.tsx
import React from "react";

interface Result {
	id: string;
	display_name: string;
	relevance_score: number;
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
	const [entityType, setEntityType] = useState("works"); // Default to "works"

	const performSearch = async () => {
		if (!query) return; // Avoid searching if the query is empty

		const entityTypes =
			entityType === "all"
				? ["works", "concepts", "authors", "institutions", "sources"]
				: [entityType];

		try {
			const fetchPromises = entityTypes.map(async (type) => {
				const url = `https://api.openalex.org/${type}?search=${encodeURIComponent(
					query
				)}`;

				const response = await fetch(url);
				const data = await response.json();

				// Map the OpenAlex response to your app's structure
				return data.results.map((result: any) => ({
					id: result.id,
					display_name: result.display_name,
					relevance_score: result.relevance_score || 0, // Include relevance_score
				}));
			});

			const resultsArrays = await Promise.all(fetchPromises);
			const combinedResults = resultsArrays.flat();

			// Sort the combined results by relevance_score in descending order
			combinedResults.sort(
				(a, b) => b.relevance_score - a.relevance_score
			);

			// Update search results in context
			setSearchResults([
				{
					meta: {
						count: combinedResults.length,
						db_response_time_ms: 0,
						page: 1,
						per_page: combinedResults.length,
					},
					results: combinedResults,
				},
			]);
		} catch (error) {
			console.error("Error fetching search results:", error);
			setSearchResults([]);
		}
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
				<option value="works">Works</option>
				<option value="concepts">Concepts</option>
				<option value="authors">Authors</option>
				<option value="institutions">Institutions</option>
				<option value="sources">Sources</option>
				<option value="all">All</option> {/* Added "All" option */}
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

	if (searchResults.length === 0 || searchResults[0].results.length === 0) {
		return <p>No results found.</p>;
	}

	return (
		<div className="search-results">
			{searchResults[0].results.map((result) => (
				<div key={result.id} className="search-result">
					<h3>{result.display_name}</h3>
					<p>Relevance Score: {result.relevance_score.toFixed(2)}</p>
					<p>Entity Type: {getEntityTypeFromId(result.id)}</p>
				</div>
			))}
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
