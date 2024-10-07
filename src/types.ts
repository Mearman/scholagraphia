import { ReactNode } from "react";

export interface Entity {
	id: string;
	display_name: string;
	type:
		| "work"
		| "author"
		| "institution"
		| "concept"
		| "source"
		| "country"
		| "license";
}

export interface SearchResult {
	id: string;
	display_name: string;
	entity_type: string;
}

export interface RelatedNode {
	id: string;
	display_name: string;
	type: string;
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
	setCollections: (collections: Collection[]) => void;
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
}

export interface AppProviderProps {
	children: ReactNode;
}
