import { Monitor, Moon, Sun } from "lucide-react";
import React from "react";
import { useAppContext } from "../context/AppContext";

const ThemeToggle: React.FC = () => {
	const { themeMode, cycleTheme } = useAppContext();

	const getIcon = () => {
		switch (themeMode) {
			case "light":
				return <Sun size={20} className="text-yellow-500" />;
			case "dark":
				return <Moon size={20} className="text-blue-400" />;
			case "auto":
				return (
					<Monitor size={20} className="text-gray-500 dark:text-gray-400" />
				);
		}
	};

	return (
		<button
			onClick={cycleTheme}
			className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
			aria-label="Toggle theme"
			title={`Current theme: ${themeMode}`}
		>
			{getIcon()}
		</button>
	);
};

export default ThemeToggle;
