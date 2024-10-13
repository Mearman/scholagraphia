export interface Result {
	id: string;
	display_name: string;
	relevance_score: number;
}

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
	works: "works",
	concepts: "concepts",
	authors: "authors",
	institutions: "institutions",
	sources: "sources",
} as const;
type EntityType = (typeof EntityType)[keyof typeof EntityType];
export { EntityType };

export interface Collection {
    id: string;
    name: string;
    items: string[];
}
