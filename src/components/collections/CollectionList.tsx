import { useEffect } from "react";
import { CollectionProvider } from "../../contexts/CollectionContext";
import { useCollectionListContext } from "../../contexts/CollectionListContext";
import { Sidebar } from "../Sidebar";
import { CollectionItem } from "./CollectionItem";

export function CollectionList() {
	const { collections, handleCreate, activeCollection, handleSelect, status } = useCollectionListContext();

	useEffect(() => {
		if (status === "success" && collections.length === 0) {
			handleCreate("Default Collection");
		} else if (status === "success" && collections.length > 0 && !activeCollection) {
			const mostRecent = collections.reduce((prev, current) =>
				new Date(current.updated_at) > new Date(prev.updated_at) ? current : prev
			);
			handleSelect(mostRecent.id);
		}
	}, [collections, activeCollection, status]);

	return (
		<Sidebar side="left">
			<h2>Collections</h2>
			<button onClick={() => handleCreate()}>Create Collection</button>
			<ul>
				{collections.map((collection) => (
					<CollectionProvider key={collection.id} collection={collection}>
						<CollectionItem
							isActive={activeCollection?.id === collection.id}
							onSelect={() => handleSelect(collection.id)}
						/>
					</CollectionProvider>
				))}
			</ul>
		</Sidebar>
	);
}
