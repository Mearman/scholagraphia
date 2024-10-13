import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Collection } from "../types";
import {
	cloneCollection,
	createCollection,
	deleteCollection,
	getCollections,
	isoString,
	renameCollection,
} from "../api/collections.tsx";

interface CollectionListContextType {
	collections: Collection[];
	activeCollection: Collection | null;
	handleSelect: (collection: Collection) => void;
	handleClone: (collection: Collection) => void;
	handleDelete: (id: string) => void;
	handleCreate: () => void;
	handleRename: (id: string, newName: string) => void;
}

const CollectionListContext = createContext<CollectionListContextType | undefined>(undefined);

interface CollectionListProviderProps {
	children: ReactNode;
}

export const CollectionListProvider: React.FC<CollectionListProviderProps> = ({ children }) => {
	const [collections, setCollections] = useState<Collection[]>([]);
	const [activeCollection, setActiveCollection] = useState<Collection | null>(null);

	useEffect(() => {
		async function fetchCollections() {
			const collections = await getCollections();
			setCollections(collections);
		}
		fetchCollections();
	}, []);

	const handleSelect = (collection: Collection) => {
		setActiveCollection(collection);
	};

	const handleClone = async (collection: Collection) => {
		const newCollection = await cloneCollection(collection);
		setCollections([...collections, newCollection]);
	};

	const handleDelete = async (id: string) => {
		await deleteCollection(id);
		setCollections(collections.filter((collection) => collection.id !== id));
		if (activeCollection?.id === id) {
			setActiveCollection(null);
		}
	};

	const handleCreate = async (name: string = isoString()) => {
		const newCollection = await createCollection(name);
		setCollections([...collections, newCollection]);
	};

	const handleRename = async (id: string, newName: string) => {
		await renameCollection(id, newName);
		setCollections(
			collections.map((collection) => (collection.id === id ? { ...collection, name: newName } : collection))
		);
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
