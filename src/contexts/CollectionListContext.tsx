import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { isoString } from "../api/collections.ts";
import { CollectionsHook, Status } from "../api/useCollections.ts";
import { Collection } from "../types";

interface CollectionListContextType {
	collections: Collection[];
	activeCollection: Collection | null;
	handleSelect: (collectionId: string) => void;
	handleClone: (collectionId: string) => void;
	handleDelete: (id: string) => void;
	handleCreate: (name?: string) => void;
	handleRename: (id: string, newName: string) => void;
	handleAddToCollection: (itemId: string) => void;
	handleRemoveFromCollection: (itemId: string) => void;
	status: Status;
}

const CollectionListContext = createContext<CollectionListContextType | undefined>(undefined);

type CollectionListProviderProps = {
	collectionsHook: CollectionsHook;
} & PropsWithChildren;

export const CollectionListProvider: React.FC<CollectionListProviderProps> = ({ children, collectionsHook }) => {
	const [activeCollection, setActiveCollection] = useState<Collection | null>(null);
	const { collections, clone, remove, create, rename, status, updateCollection } = collectionsHook;

	// Load active collection from local storage on initialization
	useEffect(() => {
		const savedActiveCollectionId = localStorage.getItem("activeCollectionId");
		if (savedActiveCollectionId) {
			const savedActiveCollection = collections.find((collection) => collection.id === savedActiveCollectionId);
			if (savedActiveCollection) {
				setActiveCollection(savedActiveCollection);
			}
		}
	}, [collections]);

	// Save active collection to local storage whenever it changes
	useEffect(() => {
		if (activeCollection) {
			localStorage.setItem("activeCollectionId", activeCollection.id);
		} else {
			localStorage.removeItem("activeCollectionId");
		}
	}, [activeCollection]);

	const selectMostRecentCollection = () => {
		if (collections.length > 0) {
			const mostRecent = collections.reduce((prev, current) =>
				new Date(current.updated_at) > new Date(prev.updated_at) ? current : prev
			);
			setActiveCollection(mostRecent);
		}
	};

	useEffect(() => {
		if (collections.length > 0 && !activeCollection) {
			selectMostRecentCollection();
		}
	}, [collections, activeCollection]);

	const handleClone = async (collection: string) => {
		const newCollection = await clone(collection);
		setActiveCollection(newCollection);
	};

	const handleDelete = async (id: string) => {
		await remove(id);
		selectMostRecentCollection();
	};

	const handleCreate = async (name: string = isoString()) => {
		const newCollection = await create(name);
		setActiveCollection(newCollection);
	};

	const handleRename = async (id: string, newName: string) => {
		await rename(id, newName);
		if (activeCollection && activeCollection.id === id) {
			setActiveCollection({ ...activeCollection, name: newName });
		}
	};

	const handleSelect = (collectionId: string) => {
		const selectedCollection = collections.find((c) => c.id === collectionId);
		if (selectedCollection) {
			setActiveCollection(selectedCollection);
		} else {
			selectMostRecentCollection();
		}
	};

	const handleAddToCollection = async (itemId: string) => {
		if (activeCollection) {
			const updatedCollection = {
				...activeCollection,
				items: [...activeCollection.items, itemId],
				updated_at: new Date(),
			};
			await updateCollection(updatedCollection);
			setActiveCollection(updatedCollection);
		}
	};

	const handleRemoveFromCollection = async (itemId: string) => {
		if (activeCollection) {
			const updatedCollection = {
				...activeCollection,
				items: activeCollection.items.filter((id) => id !== itemId),
				updated_at: new Date(),
			};
			await updateCollection(updatedCollection);
			setActiveCollection(updatedCollection);
		}
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
				handleAddToCollection,
				handleRemoveFromCollection,
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
