export interface Result {
	id: string;
	display_name: string;
	relevance_score: number;
}

export const BASE_URL = "https://api.openalex.org";

const ThemeMode = {
	auto: "auto",
	light: "light",
	dark: "dark",
} as const;
type ThemeMode = (typeof ThemeMode)[keyof typeof ThemeMode];
export { ThemeMode };

const ViewMode = {
	grid: "grid",
	list: "list",
} as const;
type ViewMode = (typeof ViewMode)[keyof typeof ViewMode];
export { ViewMode };

const EntityType = {
	work: "work",
	concept: "concept",
	author: "author",
	institution: "institution",
	source: "source",
	topic: "topic",
	funder: "funder",
} as const;
type EntityType = (typeof EntityType)[keyof typeof EntityType];
export { EntityType };

const EntityEndpointPath: Record<EntityType, string> = {
	work: "works",
	author: "authors",
	institution: "institutions",
	concept: "concepts",
	source: "sources",
	topic: "topics",
	funder: "funders",
} as const;
type EntityEndpointPath = (typeof EntityEndpointPath)[keyof typeof EntityEndpointPath];
export { EntityEndpointPath };

const EntityCharacter: Record<EntityType, string> = {
	work: "w",
	author: "a",
	institution: "i",
	concept: "c",
	source: "s",
	topic: "t",
	funder: "f",
} as const;
type EntityCharacter = (typeof EntityCharacter)[keyof typeof EntityCharacter];
export { EntityCharacter };

export type EntityMetadata = {
	ENTITY_TYPE: EntityType;
	ENTITY_ENDPOINT: EntityEndpointPath;
	TYPE_CHAR: string;
};

export const entityTypeMappings: EntityMetadata[] = Object.entries(EntityType).map(
	([, value]: [string, EntityType]): {
		ENTITY_TYPE: EntityType;
		ENTITY_ENDPOINT: EntityEndpointPath;
		TYPE_CHAR: EntityCharacter;
	} => ({
		ENTITY_TYPE: value,
		ENTITY_ENDPOINT: EntityEndpointPath[value]!,
		TYPE_CHAR: EntityCharacter[value]!,
	})
);

export interface Collection {
	id: string;
	name: string;
	items: string[];
	created_at: Date;
	updated_at: Date;
}

export const openAlexUriRegex: RegExp =
	/(?:https?:\/\/(?:openalex\.org|api\.openalex\.org)\/)?(?:[a-zA-Z]+\/)?([A-Za-z]\d{3,})(?:\/|\?|$)/;

export function idFromUri(uri: string): string {
	const match: RegExpMatchArray = openAlexUriRegex.exec(uri)!;
	if (match && match[1]) {
		return match[1].toUpperCase();
	}
	throw new Error(`Invalid OpenAlex URI: "${uri}"`);
}

export function typeFromUri(uri: string): EntityType | "unknown" {
	return (
		entityTypeMappings.find((mapping) => mapping.TYPE_CHAR.toUpperCase() === idFromUri(uri).charAt(0).toUpperCase())
			?.ENTITY_TYPE ?? "unknown"
	);
}

export function getEntityMetadataForUri(uri: string): EntityMetadata {
	const entityType = typeFromUri(uri);
	const metadata = entityTypeMappings.find((mapping) => mapping.ENTITY_TYPE === entityType);
	if (!metadata) {
		throw new Error(`No metadata found for entity type: ${entityType}`);
	}
	return metadata;
}

export function apiUrlForUri(uri: string): string {
	const metadata = getEntityMetadataForUri(uri);
	return `${BASE_URL}/${metadata.ENTITY_ENDPOINT}/${idFromUri(uri)}`;
}
