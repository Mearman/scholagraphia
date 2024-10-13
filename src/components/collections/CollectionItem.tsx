import { useState } from "react";
import { useCollectionContext } from "../../contexts/CollectionContext";

export function CollectionItem() {
	const { collection, handleSelect, handleClone, handleDelete, handleRename } = useCollectionContext();
	const [isRenaming, setIsRenaming] = useState(false);
	const [newName, setNewName] = useState(collection.name);

	const handleRenameSubmit = () => {
		handleRename(newName);
		setIsRenaming(false);
	};

	return (
		<li>
			{isRenaming ? (
				<>
					<input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} />
					<button onClick={handleRenameSubmit}>Save</button>
					<button onClick={() => setIsRenaming(false)}>Cancel</button>
				</>
			) : (
				<>
					<span onClick={handleSelect}>{collection.name}</span>
					<button onClick={handleClone}>Clone</button>
					<button onClick={handleDelete}>Delete</button>
					<button onClick={() => setIsRenaming(true)}>Rename</button>
					<button>Share</button> {/* To be implemented */}
				</>
			)}
		</li>
	);
}
