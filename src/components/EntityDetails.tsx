import { Check, Plus } from "lucide-react";
import React from "react";
import { typeFromUri } from "../api/openAlex";
import { useAppContext } from "../context/useAppContext";
import { PartialEntity } from "../types";

const EntityDetails: React.FC = () => {
	const { selectedEntity, collectedEntities, setCollectedEntities } =
		useAppContext();

	if (!selectedEntity) return null;

	const isCollected = collectedEntities.some((entity: PartialEntity) => {
		return entity.id === selectedEntity.id;
	});

	const handleCollect = () => {
		if (!isCollected) {
			setCollectedEntities([
				...collectedEntities,
				{ ...selectedEntity, related_nodes: [] },
			]);
		}
	};

	return (
		<div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
			<h2 className="text-2xl font-bold mb-4 dark:text-white">
				{selectedEntity.display_name}
			</h2>
			<p className="text-gray-600 dark:text-gray-400 mb-4">
				Type: {typeFromUri(selectedEntity.id)}
			</p>
			<button
				onClick={handleCollect}
				className={`px-4 py-2 rounded-full flex items-center ${
					isCollected
						? "bg-green-500 text-white"
						: "bg-blue-500 text-white hover:bg-blue-600"
				}`}
				disabled={isCollected}
			>
				{isCollected ? (
					<>
						<Check size={18} className="mr-2" /> Collected
					</>
				) : (
					<>
						<Plus size={18} className="mr-2" /> Collect
					</>
				)}
			</button>
		</div>
	);
};

export default EntityDetails;
