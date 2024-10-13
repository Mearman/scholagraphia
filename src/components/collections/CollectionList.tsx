import { CollectionProvider } from "../../contexts/CollectionContext";
import { useCollectionListContext } from "../../contexts/CollectionListContext";
import { Sidebar } from "../Sidebar";
import { CollectionItem } from "./CollectionItem";

export function CollectionList() {
	const { collections, handleCreate } = useCollectionListContext();

	return (
		<Sidebar side="left">
			<h2>Collections</h2>
			<button onClick={() => handleCreate()}>Create Collection</button>
			<ul>
				{collections.map((collection) => (
					<CollectionProvider key={collection.id} collection={collection}>
						<CollectionItem />
					</CollectionProvider>
				))}
			</ul>
		</Sidebar>
	);
}
