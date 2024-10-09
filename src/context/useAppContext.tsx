import { useContext } from "react";
import { AppContextType } from "../types";
import { AppContext } from "./AppContext";

export function useAppContext(): AppContextType {
	const context = useContext(AppContext);
	if (context === undefined) {
		throw new Error("useAppContext must be used within an AppProvider");
	}
	return context;
}
