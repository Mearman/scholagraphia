import pako from "pako";
import { CollectedEntity } from "../types";

export const compressAndEncodeIds = (ids: string[]): string => {
	const idsString = ids.join(",");
	const compressed = pako.deflate(idsString);
	return btoa(
		String.fromCharCode.apply(null, compressed as unknown as number[])
	);
};

export const decodeAndDecompressIds = (encodedIds: string): string[] => {
	const compressedData = atob(encodedIds)
		.split("")
		.map((char) => char.charCodeAt(0));
	const decompressed = pako.inflate(new Uint8Array(compressedData), {
		to: "string",
	});
	return decompressed.split(",");
};

export const generateShareableLink = (
	ids: string[],
	collectionTitle: string
): string => {
	const encodedIds = compressAndEncodeIds(ids);
	const encodedTitle = encodeURIComponent(collectionTitle);
	const currentUrl = window.location.href.split("?")[0];
	return `${currentUrl}?shared=${encodedIds}&title=${encodedTitle}`;
};

export const generateShareableMultiCollectionLink = (
	collections: { name: string; ids: string[] }[]
): string => {
	const encodedCollections = btoa(JSON.stringify(collections));
	const currentUrl = window.location.href.split("?")[0];
	return `${currentUrl}?sharedCollections=${encodedCollections}`;
};

export const parseSharedIds = (
	url: string
): {
	ids: string[] | null;
	title: string | null;
	collections: { name: string; ids: string[] }[] | null;
} => {
	const urlParams = new URLSearchParams(url.split("?")[1]);
	const sharedParam = urlParams.get("shared");
	const titleParam = urlParams.get("title");
	const sharedCollectionsParam = urlParams.get("sharedCollections");

	if (sharedCollectionsParam) {
		try {
			const decodedCollections = JSON.parse(atob(sharedCollectionsParam));
			return { ids: null, title: null, collections: decodedCollections };
		} catch (error) {
			console.error("Error parsing shared collections:", error);
			return { ids: null, title: null, collections: null };
		}
	}

	return {
		ids: sharedParam ? decodeAndDecompressIds(sharedParam) : null,
		title: titleParam ? decodeURIComponent(titleParam) : null,
		collections: null,
	};
};

export const mergeSharedIds = (
	existingEntities: CollectedEntity[],
	sharedIds: string[]
): CollectedEntity[] => {
	const existingIds = new Set(existingEntities.map((entity) => entity.id));
	const newIds = sharedIds.filter((id) => !existingIds.has(id));
	// const newEntities: CollectedEntity[] = newIds.map((id) => ({
	// 	id,
	// 	display_name: "Loading...",
	// 	type: "unknown",
	// 	related_nodes: [],
	// }));
	const newEntities: CollectedEntity[] = newIds.map((id) => ({
		id,
		display_name: "Loading...",
		type: "unknown",
		related_nodes: [],
	}));

	return [...existingEntities, ...newEntities];
};
