import { createContext, PropsWithChildren, useContext, useState } from "react";
import { CollectionsHook, Status } from "../api/useCollections.ts";
import { Collection } from "../types";

interface CollectionListContextType {
	collections: Collection[];
	activeCollection: Collection | null;
	handleSelect: (collection: Collection) => void;
	handleClone: (collection: Collection) => void;
	handleDelete: (id: string) => void;
	handleCreate: () => void;
	handleRename: (id: string, newName: string) => void;
	status: Status;
}

const CollectionListContext = createContext<CollectionListContextType | undefined>(undefined);

type CollectionListProviderProps = {
	collectionsHook: CollectionsHook;
} & PropsWithChildren;

export const CollectionListProvider: React.FC<CollectionListProviderProps> = ({ children, collectionsHook }) => {
	const [activeCollection, setActiveCollection] = useState<Collection | null>(null);
	const { collections, clone, remove, create, rename, status } = collectionsHook;
	const handleClone = async (collection: Collection) => {
		const newCollection = await clone(collection);
		setActiveCollection(newCollection);
	};
	const handleDelete = async (id: string) => {
		await remove(id);
		setActiveCollection(null);
	};
	const handleCreate = async () => {
		const newCollection = await create();
		setActiveCollection(newCollection);
	};
	const handleRename = async (id: string, newName: string) => {
		await rename(id, newName);
	};
	const handleSelect = (collection: Collection) => {
		setActiveCollection(collection);
	};

	return (
		<CollectionListContext.Provider
			value={{
				collections,
				activeCollection,
				handleSelect,
				handleClone,
				handleDelete,
				handleCreate,
				handleRename,
				status,
			}}
		>
			{children}
		</CollectionListContext.Provider>
	);
};

export const useCollectionListContext = () => {
	const context = useContext(CollectionListContext);
	if (!context) {
		throw new Error("useCollectionListContext must be used within a CollectionListProvider");
	}
	return context;
};
