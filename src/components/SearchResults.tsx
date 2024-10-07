import React from "react";
import { getEntityDetails, getRelatedEntities } from "../api/openAlex";
import { useAppContext } from "../context/AppContext";
import { CollectedEntity, SearchResult } from "../types";
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
			const normalizedType = result.entity_type.endsWith("s")
				? result.entity_type.slice(0, -1)
				: result.entity_type;
			const entityDetails = await getEntityDetails(result.id);
			console.log("Entity details fetched:", entityDetails);
			const relatedNodes = await getRelatedEntities(result.id);
			console.log("Related nodes fetched:", relatedNodes);
			const newEntity: CollectedEntity = {
				...entityDetails,
				related_nodes: relatedNodes,
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
			{searchResults.map((result) => (
				<EntityCard
					key={result.id}
					entity={result}
					onCollect={() => handleCollect(result)}
					onRemove={() => handleRemove(result.id)}
					isCollected={isCollected(result.id)}
					showCollectButton={true}
					onShowRelated={onShowRelated}
				/>
			))}
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
