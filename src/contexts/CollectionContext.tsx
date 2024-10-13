import { createContext, useContext } from "react";
import { Collection } from "../types";
import { useCollectionListContext } from "./CollectionListContext";

interface CollectionContextType {
	collection: Collection;
	handleSelect: () => void;
	handleClone: () => void;
	handleDelete: () => void;
	handleRename: (newName: string) => void;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export const CollectionProvider: React.FC<{ collection: Collection; children: React.ReactNode }> = ({
	collection,
	children,
}) => {
	const {
		handleSelect: select,
		handleClone: clone,
		handleDelete: del,
		handleRename: rename,
	} = useCollectionListContext();

	const handleSelect = () => select(collection.id);
	const handleClone = () => clone(collection.id);
	const handleDelete = () => del(collection.id);
	const handleRename = (newName: string) => rename(collection.id, newName);

	return (
		<CollectionContext.Provider value={{ collection, handleSelect, handleClone, handleDelete, handleRename }}>
			{children}
		</CollectionContext.Provider>
	);
};

export const useCollectionContext = () => {
	const context = useContext(CollectionContext);
	if (!context) {
		throw new Error("useCollectionContext must be used within a CollectionProvider");
	}
	return context;
};
