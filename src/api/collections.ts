import { openDB } from "idb";
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

export async function getCollections(): Promise<Collection[]> {
	const db = await getDB();
	return db.getAll(STORE_NAME);
}

export async function getCollection(id: string): Promise<Collection> {
	const db = await getDB();
	return db.get(STORE_NAME, id);
}

export async function addCollection(collection: Collection) {
	const db = await getDB();
	return db.put(STORE_NAME, collection);
}

export async function addCollections(
	collections: Collection[]
): Promise<(string | number | Date | ArrayBufferView | ArrayBuffer | IDBValidKey[])[]> {
	const db = await getDB();
	const keys = [];
	for await (const collection of collections) {
		const key = await db.put(STORE_NAME, collection);
		keys.push(key);
	}
	return keys;
}

export async function deleteCollection(id: string) {
	const db = await getDB();
	return db.delete(STORE_NAME, id);
}

export async function deleteCollections(ids: string[]) {
	const db = await getDB();
	for (const id of ids) {
		await db.delete(STORE_NAME, id);
	}
}

export async function cloneCollection(collectionId: string): Promise<Collection> {
	const collection = await getCollection(collectionId);
	const newCollection = {
		...collection,
		id: uuidv4(),
		name: `${collection.name} (Clone)`,
		updated_at: new Date(),
		created_at: new Date(),
	};
	await addCollection(newCollection);
	return newCollection;
}

export async function cloneCollections(collectionIds: string[]): Promise<Collection[]> {
	const clonedCollections = [];
	for await (const collection of collectionIds) {
		clonedCollections.push(await cloneCollection(collection));
	}
	return clonedCollections;
}

export async function createCollection(name: string): Promise<Collection> {
	const newCollection = { id: uuidv4(), name, items: [], created_at: new Date(), updated_at: new Date() };
	await addCollection(newCollection);
	return newCollection;
}

export async function renameCollection(id: string, newName: string) {
	const db = await getDB();
	const collection = await db.get(STORE_NAME, id);
	if (collection) {
		collection.name = newName;
		collection.updated_at = new Date();
		await db.put(STORE_NAME, collection);
	}
}

export async function updateCollection(updatedCollection: Collection) {
	const db = await getDB();
	await db.put(STORE_NAME, updatedCollection);
}

function uuidv4() {
	return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
		(+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)
	);
}

export function isoString() {
	return new Date().toISOString();
}

export interface CollectionsRepository<T = unknown> {
	getCollections(): Promise<Collection[]>;
	getCollection(id: string): Promise<Collection>;
	addCollection(collection: Collection): Promise<T>;
	addCollections(collections: Collection[]): Promise<T[]>;
	deleteCollection(id: string): Promise<void>;
	deleteCollections(ids: string[]): Promise<void>;
	cloneCollection(collection: string): Promise<Collection>;
	cloneCollections(collections: string[]): Promise<Collection[]>;
	createCollection(name: string): Promise<Collection>;
	renameCollection(id: string, newName: string): Promise<void>;
	updateCollection(updatedCollection: Collection): Promise<void>;
}

export class IdbCollections implements CollectionsRepository<IDBValidKey> {
	async getCollections(): Promise<Collection[]> {
		return getCollections();
	}

	async getCollection(id: string): Promise<Collection> {
		return getCollection(id);
	}

	async addCollection(collection: Collection): Promise<IDBValidKey> {
		return await addCollection(collection);
	}

	async addCollections(collections: Collection[]): Promise<IDBValidKey[]> {
		return await addCollections(collections);
	}

	async deleteCollection(id: string): Promise<void> {
		return deleteCollection(id);
	}

	async deleteCollections(ids: string[]): Promise<void> {
		return deleteCollections(ids);
	}

	async cloneCollection(collection: string): Promise<Collection> {
		return cloneCollection(collection);
	}

	async cloneCollections(collections: string[]): Promise<Collection[]> {
		return cloneCollections(collections);
	}

	async createCollection(name: string): Promise<Collection> {
		return createCollection(name);
	}

	async renameCollection(id: string, newName: string): Promise<void> {
		return renameCollection(id, newName);
	}

	async updateCollection(updatedCollection: Collection): Promise<void> {
		return updateCollection(updatedCollection);
	}
}
