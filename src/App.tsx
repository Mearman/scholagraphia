import "./App.css";
import { AppContextProvider } from "./AppContext";
import { CollectionList } from "./components/collections/CollectionList";
import { CurrentCollection } from "./components/collections/CurrentCollection";
import { SearchBar } from "./components/SearchBar";
import { SearchResults } from "./components/SearchResults";
import { CollectionListProvider } from "./contexts/CollectionListContext";

export function App(): JSX.Element {
	return (
		<AppContextProvider>
			<CollectionListProvider>
				<div className="app-container">
					<CollectionList />
					<div className="main-content">
						<header>
							<h1>Scholagraphia</h1>
						</header>
						<main>
							<SearchBar />
							<SearchResults />
						</main>
						<footer>
							<p>&copy; {new Date().getFullYear()} Scholagraphia. All rights reserved.</p>
						</footer>
					</div>
					<CurrentCollection />
				</div>
			</CollectionListProvider>
		</AppContextProvider>
	);
}

export default App;
