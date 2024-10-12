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
