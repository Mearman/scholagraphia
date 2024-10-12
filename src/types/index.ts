export interface Result {
	id: string;
	display_name: string;
	relevance_score: number;
}

const ThemeMode = {
	light: "light",
	dark: "dark",
	auto: "auto",
} as const;
type ThemeMode = (typeof ThemeMode)[keyof typeof ThemeMode];
export { ThemeMode };

const ViewMode = {
	grid: "grid",
	list: "list",
} as const;
type ViewMode = (typeof ViewMode)[keyof typeof ViewMode];
export { ViewMode };
