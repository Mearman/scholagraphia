import { Database } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import {
	getEntityDetails,
	getRelatedEntities,
	searchEntities,
} from "./api/openAlex";
import CollectedEntities from "./components/CollectedEntities";
import CollectionManager from "./components/CollectionManager";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import ThemeToggle from "./components/ThemeToggle";
import { AppProvider, useAppContext } from "./context/AppContext";
import { SearchResult } from "./types";

const AppContent: React.FC = () => {
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const { collections, setCollections } = useAppContext();
	const [currentQuery, setCurrentQuery] = useState("");
	const [currentEntityType, setCurrentEntityType] = useState("all");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const savedCollections = localStorage.getItem("collections");
		if (savedCollections) {
			setCollections(JSON.parse(savedCollections));
		}
	});

	useEffect(() => {
		localStorage.setItem("collections", JSON.stringify(collections));
	}, [collections]);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const query = params.get("q") || "";
		const entityType = params.get("type") || "all";
		const relatedId = params.get("related");

		if (relatedId) {
			handleShowRelated(relatedId);
		} else if (query) {
			setCurrentQuery(query);
			setCurrentEntityType(entityType);
			performSearch(query, entityType);
		}
	}, [setCurrentQuery]);

	const performSearch = useCallback(
		async (query: string, entityType: string) => {
			setIsLoading(true);
			setError(null);
			try {
				const results = await searchEntities(query, entityType);
				setSearchResults(results);
			} catch (error) {
				console.error("Search error:", error);
				setError(
					"An error occurred while searching. Please try again."
				);
				setSearchResults([]);
			} finally {
				setIsLoading(false);
			}
		},
		[]
	);

	const handleNewSearch = (
		results: SearchResult[],
		query: string,
		entityType: string
	) => {
		setSearchResults(results);
		setIsLoading(false);
		setCurrentQuery(query);
		setCurrentEntityType(entityType);
		updateURL(query, entityType);
		updatePageTitle(query);
	};

	const updateURL = (query: string, entityType: string) => {
		const url = new URL(window.location.href);
		url.searchParams.set("q", query);
		if (entityType !== "all") {
			url.searchParams.set("type", entityType);
		} else {
			url.searchParams.delete("type");
		}
		url.searchParams.delete("related");
		window.history.pushState({}, "", url.toString());
	};

	const updatePageTitle = (query: string) => {
		document.title = query ? `${query} - Scholagraphia` : "Scholagraphia";
	};

	const handleShowRelated = useCallback(async (entityId: string) => {
		setIsLoading(true);
		setError(null);
		setSearchResults([]);

		try {
			const relatedEntities = await getRelatedEntities(entityId);
			setSearchResults(relatedEntities);

			// Update URL for related entities
			const url = new URL(window.location.href);
			url.searchParams.set("related", entityId.split("/").pop() || "");
			url.searchParams.delete("q");
			url.searchParams.delete("type");
			window.history.pushState({}, "", url.toString());

			// Update page title for related entities
			const entityDetails = await getEntityDetails(entityId);
			updatePageTitle(`Related to ${entityDetails.display_name}`);
		} catch (error) {
			console.error("Error fetching related entities:", error);
			setError(
				"An error occurred while fetching related entities. Please try again."
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		const handlePopState = () => {
			const params = new URLSearchParams(window.location.search);
			const query = params.get("q") || "";
			const entityType = params.get("type") || "all";
			const relatedId = params.get("related");

			if (relatedId) {
				handleShowRelated(relatedId);
			} else if (query) {
				setCurrentQuery(query);
				setCurrentEntityType(entityType);
				performSearch(query, entityType);
			} else {
				setSearchResults([]);
				setCurrentQuery("");
				setCurrentEntityType("all");
			}
			updatePageTitle(query);
		};

		window.addEventListener("popstate", handlePopState);
		return () => {
			window.removeEventListener("popstate", handlePopState);
		};
	}, [performSearch, handleShowRelated]);

	return (
		<div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 transition-colors duration-200">
			<header className="mb-8 relative">
				<div className="absolute top-0 right-0">
					<ThemeToggle />
				</div>
				<h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center">
					<Database className="mr-2" size={36} />
					Scholagraphia
				</h1>
			</header>
			<main className="max-w-4xl mx-auto">
				<div className="flex justify-center mb-8">
					<SearchBar
						onNewSearch={handleNewSearch}
						setIsLoading={setIsLoading}
						initialQuery={currentQuery}
						initialEntityType={currentEntityType}
					/>
				</div>
				{error && (
					<div
						className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
						role="alert"
					>
						<strong className="font-bold">Error: </strong>
						<span className="block sm:inline">{error}</span>
					</div>
				)}
				<SearchResults
					searchResults={searchResults}
					onShowRelated={handleShowRelated}
					isLoading={isLoading}
				/>
				<CollectionManager />
				<CollectedEntities onShowRelated={handleShowRelated} />
			</main>
		</div>
	);
};

const App: React.FC = () => (
	<AppProvider>
		<AppContent />
	</AppProvider>
);

export default App;
