import { useEffect, useState } from "react";
import { Collection } from "../types";
import { cloneCollection, createCollection, deleteCollection, getCollections, isoString, renameCollection } from "./collections";

const Status = {
	IDLE: 'idle',
	LOADING: 'loading',
	ERROR: 'error',
	SUCCESS: 'success'
} as const;
type Status = typeof Status[keyof typeof Status];
export { Status };

export const useCollections = () => {
	const [status, setStatus] = useState<Status>(Status.IDLE);
	const [collections, setCollections] = useState<Collection[]>([]);
	useEffect(() => {
		setStatus(Status.LOADING);
		const fetchCollections = async () => {
		
				const collectionsResponse = await getCollections();
				setStatus('success');
				setCollections(collectionsResponse);
			
		}
		fetchCollections();
	}, []);

	const clone = async (collection: Collection) => {
		const newCollection = await cloneCollection(collection);
		setCollections([...collections, newCollection]);
		return newCollection;
	};

	const remove = async (id: string) => {
		await deleteCollection(id);
		setCollections(collections.filter((collection) => collection.id !== id));
	};

	const create = async (name: string = isoString()) => {
		const newCollection = await createCollection(name);
		setCollections([...collections, newCollection]);
		return newCollection;
	};

	const rename = async (id: string, newName: string) => {
		await renameCollection(id, newName);
		setCollections(
			collections.map((collection) => (collection.id === id ? { ...collection, name: newName } : collection))
		);
	};
	return { status, collections, clone, remove, create, rename };
}

export type CollectionsHook = ReturnType<typeof useCollections>;