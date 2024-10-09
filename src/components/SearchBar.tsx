import { ChevronDown, Search, ToggleLeft, ToggleRight, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { searchEntities } from "../api/openAlex";
import { useAppContext } from "../context/useAppContext";
import { PartialEntity } from "../types";

interface SearchBarProps {
	onNewSearch: (
		query: string,
		entityType: string,
		results: PartialEntity[]
	) => void;
	setIsLoading: (isLoading: boolean) => void;
	initialQuery: string;
	initialEntityType: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
	onNewSearch,
	setIsLoading,
	initialQuery,
	initialEntityType,
}) => {
	const [query, setQuery] = useState(initialQuery);
	const [entityType, setEntityType] = useState(initialEntityType);
	const { setSearchResults, searchWhileTyping, toggleSearchWhileTyping } =
		useAppContext();
	const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const lastSearchRef = useRef<{ query: string; type: string } | null>(null);

	useEffect(() => {
		setQuery(initialQuery);
		setEntityType(initialEntityType);
	}, [initialQuery, initialEntityType]);

	const performSearch = useCallback(
		async (searchQuery: string, type: string) => {
			if (searchQuery.trim() === "") {
				setSearchResults([]);
				onNewSearch(searchQuery, type, []);
				setIsLoading(false);
				return;
			}

			if (
				lastSearchRef.current?.query === searchQuery &&
				lastSearchRef.current?.type === type
			) {
				return; // Avoid duplicate searches
			}

			setIsLoading(true);
			try {
				// const results = await autocompleteEntities(searchQuery, type);
				const results = await searchEntities<PartialEntity>(searchQuery, "all");
				setSearchResults(results.results);
				onNewSearch(searchQuery, type, results.results);
				lastSearchRef.current = { query: searchQuery, type };
			} catch (error) {
				console.error("Search error:", error);
				setSearchResults([]);
				onNewSearch(searchQuery, type, []);
			} finally {
				setIsLoading(false);
			}
		},
		[setSearchResults, onNewSearch, setIsLoading]
	);

	const debouncedSearch = useCallback(
		(searchQuery: string, type: string) => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}

			searchTimeoutRef.current = setTimeout(() => {
				performSearch(searchQuery, type);
			}, 300);
		},
		[performSearch]
	);

	useEffect(() => {
		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (searchWhileTyping && query.trim() !== "") {
			debouncedSearch(query, entityType);
		}
	}, [query, entityType, searchWhileTyping, debouncedSearch]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newQuery = e.target.value;
		setQuery(newQuery);
		if (newQuery.trim() === "") {
			handleClearSearch();
		}
	};

	const handleEntityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newType = e.target.value;
		setEntityType(newType);
		if (searchWhileTyping && query.trim() !== "") {
			debouncedSearch(query, newType);
		}
	};

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (query.trim() !== "") {
			performSearch(query, entityType);
		}
	};

	const handleClearSearch = () => {
		setQuery("");
		setSearchResults([]);
		onNewSearch("", entityType, []);
		lastSearchRef.current = null;
		setIsLoading(false);
	};

	return (
		<div className="w-full max-w-3xl">
			<form onSubmit={handleFormSubmit} className="relative mb-2">
				<div className="flex mb-2">
					<div className="relative flex-grow">
						<input
							type="text"
							value={query}
							onChange={handleInputChange}
							placeholder="Search for works, authors, institutions..."
							className="w-full px-4 py-2 pr-20 rounded-l-full border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
						/>
						<div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
							{query && (
								<button
									type="button"
									onClick={handleClearSearch}
									className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 mr-2"
									aria-label="Clear search"
								>
									<X size={20} />
								</button>
							)}
							<button
								type="submit"
								className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
								aria-label="Search"
							>
								<Search size={20} />
							</button>
						</div>
					</div>
					<div className="relative">
						<select
							value={entityType}
							onChange={handleEntityTypeChange}
							className="h-full px-4 py-2 bg-white dark:bg-gray-800 border border-l-0 border-gray-300 dark:border-gray-700 rounded-r-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none pr-8"
						>
							<option value="all">All</option>
							<option value="works">Works</option>
							<option value="authors">Authors</option>
							<option value="institutions">Institutions</option>
							<option value="concepts">Concepts</option>
							<option value="sources">Sources</option>
							<option value="publishers">Publishers</option>
							<option value="funders">Funders</option>
							<option value="countries">Countries</option>
							<option value="licenses">Licenses</option>
						</select>
						<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
							<ChevronDown size={16} />
						</div>
					</div>
				</div>
			</form>
			<div className="flex items-center justify-end text-sm text-gray-600 dark:text-gray-400">
				<span className="mr-2">Search while typing</span>
				<button
					onClick={toggleSearchWhileTyping}
					className="focus:outline-none"
					aria-label={
						searchWhileTyping
							? "Disable search while typing"
							: "Enable search while typing"
					}
				>
					{searchWhileTyping ? (
						<ToggleRight size={24} className="text-blue-500" />
					) : (
						<ToggleLeft size={24} />
					)}
				</button>
			</div>
		</div>
	);
};

export default SearchBar;
