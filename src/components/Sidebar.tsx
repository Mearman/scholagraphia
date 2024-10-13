import React, { useEffect, useRef, useState } from "react";
import { getPreference, setPreference } from "../util/preferences";

interface SidebarProps {
	side: "left" | "right";
	children: React.ReactNode;
}

export function Sidebar({ side, children }: SidebarProps) {
	const [isOpen, setIsOpen] = useState(() => getPreference(`sidebar_${side}_open`, false));
	const [isPinned, setIsPinned] = useState(() => getPreference(`sidebar_${side}_pinned`, false));
	const sidebarRef = useRef<HTMLDivElement>(null);

	const toggleSidebar = () => {
		if (!isPinned) {
			setIsOpen(!isOpen);
			setPreference(`sidebar_${side}_open`, !isOpen);
		}
	};

	const togglePin = () => {
		const newPinnedState = !isPinned;
		setIsPinned(newPinnedState);
		setIsOpen(true);
		setPreference(`sidebar_${side}_pinned`, newPinnedState);
		setPreference(`sidebar_${side}_open`, true);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && !isPinned) {
				setIsOpen(false);
				setPreference(`sidebar_${side}_open`, false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isPinned, side]);

	return (
		<div ref={sidebarRef} className={`sidebar ${side} ${isOpen || isPinned ? "open" : ""} ${isPinned ? "pinned" : ""}`}>
			<div className="sidebar-content">
				{children}
				<button className="pin-button" onClick={togglePin}>
					{isPinned ? "Unpin" : "Pin"}
				</button>
			</div>
			<button className="show-button" onClick={toggleSidebar}>
				{isOpen ? (side === "left" ? "◀" : "▶") : side === "left" ? "▶" : "◀"}
			</button>
		</div>
	);
}
