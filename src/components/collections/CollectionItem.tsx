// src/components/CollectionItem.tsx
import { useCollectionContext } from "../../contexts/CollectionContext";

export function CollectionItem() {
	const { collection, handleSelect, handleClone, handleDelete } =
		useCollectionContext();

	return (
		<li>
			<span onClick={handleSelect}>{collection.name}</span>
			<button onClick={handleClone}>Clone</button>
			<button onClick={handleDelete}>Delete</button>
			<button>Share</button> {/* To be implemented */}
		</li>
	);
}
