import { CollectionList } from "./components/collections/CollectionList";
import { CurrentCollection } from "./components/collections/CurrentCollection";
import { SearchBar } from "./components/SearchBar";
import { SearchResults } from "./components/SearchResults";
import { useCollectionListContext } from "./contexts/CollectionListContext";

const Content: React.FC = () => {
	const collections = useCollectionListContext();
	return (
		<div className="app-container">
			{collections.status === "loading" ? (
				<p>Loading...</p>
			) : (
				<>
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
				</>
			)}
		</div>
	);
};

export default Content;
