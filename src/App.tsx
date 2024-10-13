import "./App.css";
import { AppContextProvider } from "./AppContext";
import { CollectionList } from "./components/CollectionList";
import { CurrentCollection } from "./components/CurrentCollection";
import { SearchBar } from "./components/SearchBar";
import { SearchResults } from "./components/SearchResults";

export function App(): JSX.Element {
	return (
		<AppContextProvider>
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
		</AppContextProvider>
	);
}

export default App;

