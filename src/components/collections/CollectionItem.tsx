import { useState } from "react";
import { useCollectionContext } from "../../contexts/CollectionContext";

interface CollectionItemProps {
	isActive: boolean;
	onSelect: () => void;
}

export function CollectionItem({ isActive, onSelect }: CollectionItemProps) {
	const { collection, handleSelect, handleClone, handleDelete, handleRename } = useCollectionContext();
	const [isRenaming, setIsRenaming] = useState(false);
	const [newName, setNewName] = useState(collection.name);

	const handleRenameSubmit = () => {
		handleRename(newName);
		setIsRenaming(false);
	};

	return (
		<li style={{ backgroundColor: isActive ? "lightblue" : "transparent" }}>
			{isRenaming ? (
				<>
					<input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} />
					<button onClick={handleRenameSubmit}>Save</button>
					<button onClick={() => setIsRenaming(false)}>Cancel</button>
				</>
			) : (
				<>
					<span
						onClick={() => {
							handleSelect();
							onSelect();
						}}
					>
						{collection.name}
					</span>
					<button onClick={handleClone}>Clone</button>
					<button onClick={handleDelete}>Delete</button>
					<button onClick={() => setIsRenaming(true)}>Rename</button>
					<button>Share</button> {/* To be implemented */}
				</>
			)}
		</li>
	);
}
