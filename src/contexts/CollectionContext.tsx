import { createContext, useContext } from "react";
import { Collection } from "../types";
import { useCollectionListContext } from "./CollectionListContext";

interface CollectionContextType {
	collection: Collection;
	handleSelect: () => void;
	handleClone: () => void;
	handleDelete: () => void;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export const CollectionProvider: React.FC<{ collection: Collection; children: React.ReactNode }> = ({
	collection,
	children,
}) => {
	const { handleSelect: select, handleClone: clone, handleDelete: del } = useCollectionListContext();

	const handleSelect = () => select(collection);
	const handleClone = () => clone(collection);
	const handleDelete = () => del(collection.id);

	return (
		<CollectionContext.Provider value={{ collection, handleSelect, handleClone, handleDelete }}>
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
