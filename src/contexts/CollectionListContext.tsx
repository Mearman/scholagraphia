import { openDB } from "idb";
import { createContext, useContext, useEffect, useState } from "react";
import { Collection } from "../types";

const DB_NAME = "collectionsDB";
const STORE_NAME = "collections";

async function getDB() {
	return openDB(DB_NAME, 1, {
		upgrade(db) {
			db.createObjectStore(STORE_NAME, { keyPath: "id" });
		},
	});
}

async function getCollections() {
	const db = await getDB();
	return db.getAll(STORE_NAME);
}

async function addCollection(collection: Collection) {
	const db = await getDB();
	return db.put(STORE_NAME, collection);
}

async function deleteCollection(id: string) {
	const db = await getDB();
	return db.delete(STORE_NAME, id);
}

async function cloneCollection(collection: Collection) {
	const newCollection = {
		...collection,
		id: uuidv4(),
		name: `${collection.name} (Clone)`,
	};
	await addCollection(newCollection);
	return newCollection;
}

async function createCollection(name: string) {
	const newCollection = { id: uuidv4(), name, items: [] };
	await addCollection(newCollection);
	return newCollection;
}

async function renameCollection(id: string, newName: string) {
	const db = await getDB();
	const collection = await db.get(STORE_NAME, id);
	if (collection) {
		collection.name = newName;
		await db.put(STORE_NAME, collection);
	}
}

function uuidv4() {
	return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
		(+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)
	);
}

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

import { ReactNode } from "react";

interface CollectionListProviderProps {
	children: ReactNode;
}

function isoString() {
	return new Date().toISOString();
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
