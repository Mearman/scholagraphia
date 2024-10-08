import React from "react";
import {
	getEntityDetails,
	getRelatedEntities,
	typeFromUri,
} from "../api/openAlex";
import { useAppContext } from "../context/useAppContext";
import { CollectedEntity, Entity, SearchResult } from "../types";
import EntityCard from "./EntityCard";
import Spinner from "./Spinner";

interface SearchResultsProps {
	searchResults: SearchResult[];
	onShowRelated: (relatedId: string) => void;
	isLoading: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({
	searchResults = [],
	onShowRelated,
	isLoading,
}) => {
	const { collections, setCollections, activeCollectionId } = useAppContext();

	const handleCollect = async (result: SearchResult) => {
		try {
			console.log(
				`Collecting entity: ${result.id} (${result.entity_type})`
			);
			const entityDetails = await getEntityDetails(result.id);
			console.log("Entity details fetched:", entityDetails);
			const relatedNodes = await getRelatedEntities(result.id);
			console.log("Related nodes fetched:", relatedNodes);
			const newEntity: CollectedEntity = {
				...entityDetails,
				related_nodes: relatedNodes.map((node) => ({
					...node,
					type: node.entity_type, // Assuming entity_type is the correct field for type
				})),
				id: result.id,
				display_name: result.display_name,
				type: typeFromUri(result.id),
			};

			const updatedCollections = collections.map((collection) =>
				collection.id === activeCollectionId
					? {
							...collection,
							entities: [...collection.entities, newEntity],
					  }
					: collection
			);

			setCollections(updatedCollections);

			console.log("Entity collected successfully:", newEntity);
		} catch (error) {
			console.error("Error collecting entity:", error);
			let errorMessage =
				"An unknown error occurred while collecting the entity.";
			if (error instanceof Error) {
				errorMessage = `${error.name}: ${error.message}`;
				console.error("Error stack:", error.stack);
			}
			console.error("Detailed error information:", {
				entityId: result.id,
				entityType: result.entity_type,
				errorMessage: errorMessage,
			});
			alert(`Failed to collect entity: ${errorMessage}`);
		}
	};

	const handleRemove = (id: string) => {
		const updatedCollections = collections.map((collection) =>
			collection.id === activeCollectionId
				? {
						...collection,
						entities: collection.entities.filter(
							(entity) => entity.id !== id
						),
				  }
				: collection
		);

		setCollections(updatedCollections);

		console.log(`Entity removed: ${id}`);
	};

	const isCollected = (id: string) => {
		const activeCollection = collections.find(
			(c) => c.id === activeCollectionId
		);
		return activeCollection
			? activeCollection.entities.some((entity) => entity.id === id)
			: false;
	};

	return (
		<div className="mt-4">
			<h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
				Search Results
			</h2>
			{searchResults.map((result: SearchResult) => {
				const entity = resultToEntity(result);
				return (
					<EntityCard
						key={entity.id}
						entity={entity}
						onCollect={() => handleCollect(result)}
						onRemove={() => handleRemove(entity.id)}
						isCollected={isCollected(entity.id)}
						showCollectButton={true}
						onShowRelated={onShowRelated}
					/>
				);
			})}
			{isLoading && (
				<div className="flex justify-center items-center h-32">
					<Spinner size={32} className="text-blue-500" />
				</div>
			)}
			{!isLoading && searchResults.length === 0 && (
				<p className="text-gray-600 dark:text-gray-400">
					No results found. Try a different search query.
				</p>
			)}
		</div>
	);
};

export default SearchResults;

function resultToEntity(result: SearchResult): Entity {
	return {
		id: result.id,
		display_name: result.display_name,
		type: result.entity_type,
	};
}
