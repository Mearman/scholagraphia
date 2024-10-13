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

export async function getCollections() {
	const db = await getDB();
	return db.getAll(STORE_NAME);
}

export async function getCollection(id: string) {
	const db = await getDB();
	return db.get(STORE_NAME, id);
}

async function addCollection(collection: Collection) {
	const db = await getDB();
	return db.put(STORE_NAME, collection);
}

export async function addCollections(collections: Collection[]) {
	const db = await getDB();
	for (const collection of collections) {
		await db.put(STORE_NAME, collection);
	}
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

export async function cloneCollection(collection: Collection): Promise<Collection> {
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

export function cloneCollections(collections: Collection[]): Promise<Collection>[] {
	return collections.map((collection) => cloneCollection(collection));
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

function uuidv4() {
	return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
		(+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)
	);
}

export function isoString() {
	return new Date().toISOString();
}
