import { ThemeMode } from "../types";

export function isThemeMode(
	mode: string | undefined | null
): mode is ThemeMode {
	return mode ? ["light", "dark", "auto"].includes(mode) : false;
}
