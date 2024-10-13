import "./App.css";
import { AppContextProvider } from "./AppContext";
import { SearchBar } from "./components/SearchBar";
import { SearchResults } from "./components/SearchResults";
import { Sidebar } from "./components/Sidebar";

export function App(): JSX.Element {
	return (
		<AppContextProvider>
			<div className="app-container">
				<Sidebar side="left">
					<h2>Collections</h2>
				</Sidebar>
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
				<Sidebar side="right">
					<h2>Collected</h2>
				</Sidebar>
			</div>
		</AppContextProvider>
	);
}

export default App;
