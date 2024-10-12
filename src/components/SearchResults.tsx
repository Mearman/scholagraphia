import { useContext, useEffect } from "react";
import { AppContext, AppContextType } from "../AppContext";

import { getEntityTypeFromId } from "../util/GetEntityTypeFromId";

export function SearchResults(): JSX.Element {
	const {
		searchResults,
		currentPage,
		setCurrentPage,
		isLoading,
		performSearch,
		noMoreResults,
		viewMode,
	}: AppContextType = useContext(AppContext);

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
