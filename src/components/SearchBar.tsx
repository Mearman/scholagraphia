import { useContext, useEffect } from "react";
import { AppContext } from "../AppContext";
import { ThemeMode, ViewMode } from "../types";

export const themeOrder: ThemeMode[] = Array.from(new Set(Object.values(ThemeMode)));

export function SearchBar(): JSX.Element {
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
		setTheme((prevTheme: ThemeMode): ThemeMode => nextIndex(themeOrder, prevTheme));
	};

	useEffect(() => {
		if (searchWhileTyping) {
			handleSearch();
		}
	}, [query, entityType, searchWhileTyping]);

	const getThemeIcon = () => {
		switch (theme) {
			case ThemeMode.light:
				return "☀️";
			case ThemeMode.dark:
				return "🌑";
			case ThemeMode.auto:
				return "🖥️";
		}
	};

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
				<select value={entityType} onChange={(e) => setEntityType(e.target.value)}>
					<option value="works">Works</option>
					<option value="concepts">Concepts</option>
					<option value="authors">Authors</option>
					<option value="institutions">Institutions</option>
					<option value="sources">Sources</option>
					<option value="all">All</option>
				</select>
				<select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
					<option value={10}>10 per page</option>
					<option value={20}>20 per page</option>
					<option value={50}>50 per page</option>
					<option value={100}>100 per page</option>
				</select>
				<select value={viewMode} onChange={(e) => setViewMode(e.target.value as ViewMode)}>
					<option value="grid">Grid View</option>
					<option value="list">List View</option>
				</select>
				<button onClick={toggleTheme}>{getThemeIcon()}</button>
			</div>
			<div className="search-settings">
				<label>
					<input type="checkbox" checked={searchWhileTyping} onChange={(e) => setSearchWhileTyping(e.target.checked)} />
					Search while typing
				</label>
				<label>
					<input type="checkbox" checked={sortOnLoad} onChange={(e) => setSortOnLoad(e.target.checked)} />
					Dynamic sort
				</label>
				<label>
					Cache Expiry (ms):
					<input type="number" min="0" value={cacheExpiryMs} onChange={(e) => setCacheExpiry(Number(e.target.value))} />
				</label>
			</div>
		</div>
	);
}

function nextIndex<T>(order: T[], previous: T): T {
	const currentIndex = order.indexOf(previous as T);
	const nextIndex = (currentIndex + 1) % order.length;
	return order[nextIndex];
}
