import { ReactNode } from "react";

const EntityType = {
	work: "work",
	author: "author",
	institution: "institution",
	concept: "concept",
	source: "source",
	topic: "topic",
	funder: "funder",
	// country: "country",
	// license: "license",
	// unknown: "unknown",
} as const;
type EntityType = (typeof EntityType)[keyof typeof EntityType];

const EntityEndpointPath: Record<EntityType, string> = {
	work: "works",
	author: "authors",
	institution: "institutions",
	concept: "concepts",
	source: "sources",
	topic: "topics",
	funder: "funders",
	// country: "countries",
	// license: "licenses",
	// unknown: "unknown",
} as const;

type EntityEndpointPath =
	(typeof EntityEndpointPath)[keyof typeof EntityEndpointPath];

const EntityCharacter: Record<EntityType, string> = {
	work: "w",
	author: "a",
	institution: "i",
	concept: "c",
	source: "s",
	topic: "t",
	funder: "f",
	// country: "",
	// license: "",
	// unknown: "",
} as const;

type EntityCharacter = (typeof EntityCharacter)[keyof typeof EntityCharacter];

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


export { EntityCharacter, EntityEndpointPath, EntityType };

export interface Entity {
	id: string;
	display_name: string;
	type: EntityType | "unknown";
}

export interface SearchResult {
	id: string;
	display_name: string;
	entity_type: EntityType | "unknown";
}

export interface RelatedNode {
	id: string;
	display_name: string;
	type: EntityType | "unknown";
}

export function isCollectedEntity(
	something: unknown
): something is CollectedEntity {
	return (something as CollectedEntity).related_nodes !== undefined;
}
export function isCollection(something: unknown): something is Collection {
	return (something as Collection).id !== undefined;
}

export interface CollectedEntity extends Entity {
	related_nodes: RelatedNode[];
}

export interface Collection {
	id: string;
	name: string;
	entities: CollectedEntity[];
}

export type ThemeMode = "light" | "dark" | "auto";

export interface AppContextType {
	searchResults: SearchResult[];
	setSearchResults: (results: SearchResult[]) => void;
	collections: Collection[];
	activeCollectionId: string;
	setActiveCollectionId: (id: string) => void;
	selectedEntity: Entity | null;
	setSelectedEntity: (entity: Entity | null) => void;
	exportCollections: () => void;
	importAndMergeCollections: (importedCollections: Collection[]) => void;
	importAndReplaceCollections: (importedCollections: Collection[]) => void;
	clearAllCollections: () => void;
	createNewCollection: () => void;
	mergeCollections: (collectionIds: string[]) => void;
	cloneCollection: (collectionId: string) => void;
	splitCollection: (collectionId: string, entityIds: string[]) => void;
	themeMode: ThemeMode;
	cycleTheme: () => void;
	searchWhileTyping: boolean;
	toggleSearchWhileTyping: () => void;
	collectedEntities: CollectedEntity[];
	setCollectedEntities: (entities: CollectedEntity[]) => void;
	setCollections: (collections: Collection[]) => void;
}

export interface AppProviderProps {
	children: ReactNode;
}
