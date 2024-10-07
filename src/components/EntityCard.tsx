import { ChevronDown, ChevronUp, Link, Plus, Share2, X } from "lucide-react";
import React, { useState } from "react";

interface EntityCardProps {
	entity: any;
	onCollect?: () => void;
	onRemove?: () => void;
	isCollected?: boolean;
	showCollectButton?: boolean;
	onShowRelated?: (entityId: string) => void;
}

const EntityCard: React.FC<EntityCardProps> = ({
	entity,
	onCollect,
	onRemove,
	isCollected,
	showCollectButton = true,
	onShowRelated,
}) => {
	const [expanded, setExpanded] = useState(false);

	const toggleExpand = () => setExpanded(!expanded);

	const renderValue = (value: any): React.ReactNode => {
		if (
			typeof value === "string" ||
			typeof value === "number" ||
			typeof value === "boolean"
		) {
			return String(value);
		} else if (Array.isArray(value)) {
			return `[${value.length} items]`;
		} else if (typeof value === "object" && value !== null) {
			return "{...}";
		}
		return "N/A";
	};

	const getEntityTypeAndColor = (entityId: string): [string, string] => {
		const prefix = entityId.split("/")[3]?.charAt(0).toLowerCase();
		switch (prefix) {
			case "w":
				return ["work", "bg-blue-500"];
			case "a":
				return ["author", "bg-green-500"];
			case "i":
				return ["institution", "bg-yellow-500"];
			case "c":
				return ["concept", "bg-purple-500"];
			case "s":
				return ["source", "bg-red-500"];
			case "p":
				return ["publisher", "bg-indigo-500"];
			case "f":
				return ["funder", "bg-pink-500"];
			case "t":
				return ["topic", "bg-teal-500"];
			default:
				return ["unknown", "bg-gray-500"];
		}
	};

	const [entityType, typeColor] = getEntityTypeAndColor(entity.id);

	const handleShowRelated = () => {
		if (onShowRelated) {
			onShowRelated(entity.id);
		}
	};

	const handleShare = () => {
		const url = new URL(window.location.href);
		url.searchParams.set("related", entity.id.split("/").pop() || "");
		url.searchParams.delete("q");
		url.searchParams.delete("type");
		navigator.clipboard
			.writeText(url.toString())
			.then(() => {
				alert("Link copied to clipboard!");
			})
			.catch((err) => {
				console.error("Failed to copy link: ", err);
				alert(
					"Failed to copy link. You can manually copy it from the console."
				);
				console.log("Shareable link:", url.toString());
			});
	};

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4 overflow-hidden flex">
			<div
				className={`w-8 ${typeColor} flex-shrink-0 flex items-center justify-center`}
			>
				<div className="transform -rotate-90 text-white font-semibold text-xs uppercase whitespace-nowrap origin-center">
					{entityType}
				</div>
			</div>
			<div className="flex-grow p-4 overflow-hidden flex flex-col">
				<div className="flex justify-between items-start mb-2">
					<div className="flex-grow mr-4 min-w-0">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white break-words">
							{entity.display_name}
						</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400 break-all">
							{entity.id}
						</p>
					</div>
					<div className="flex-shrink-0 flex items-center">
						<button
							onClick={handleShowRelated}
							className="mr-2 p-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
							title="Show related entities"
						>
							<Link size={20} />
						</button>
						<button
							onClick={handleShare}
							className="mr-2 p-2 text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
							title="Share entity"
						>
							<Share2 size={20} />
						</button>
						<button
							onClick={toggleExpand}
							className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
						>
							{expanded ? (
								<ChevronUp size={20} />
							) : (
								<ChevronDown size={20} />
							)}
						</button>
					</div>
				</div>
				{expanded && (
					<div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
						{Object.entries(entity).map(([key, value]) => (
							<div key={key} className="mb-2">
								<span className="font-semibold">{key}:</span>{" "}
								{renderValue(value as any)}
							</div>
						))}
					</div>
				)}
			</div>
			<div className="flex-shrink-0 flex">
				{showCollectButton && (
					<button
						onClick={isCollected ? onRemove : onCollect}
						className={`w-16 h-full flex items-center justify-center ${
							isCollected
								? "bg-red-500 text-white hover:bg-red-600"
								: "bg-blue-500 text-white hover:bg-blue-600"
						}`}
					>
						{isCollected ? <X size={24} /> : <Plus size={24} />}
					</button>
				)}
				{!showCollectButton && onRemove && (
					<button
						onClick={onRemove}
						className="w-16 h-full flex items-center justify-center bg-red-500 text-white hover:bg-red-600"
					>
						<X size={24} />
					</button>
				)}
			</div>
		</div>
	);
};

export default EntityCard;
