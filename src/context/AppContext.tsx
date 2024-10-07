import React, { createContext, useContext, useEffect, useState } from "react";
import { getEntityDetails, getRelatedEntities } from "../api/openAlex";
import {
	AppContextType,
	AppProviderProps,
	CollectedEntity,
	Collection,
	Entity,
	SearchResult,
	ThemeMode,
} from "../types";
import { mergeSharedIds, parseSharedIds } from "../utils/idSharing";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [collections, setCollections] = useState<Collection[]>(() => {
		const savedCollections = localStorage.getItem("collections");
		return savedCollections
			? JSON.parse(savedCollections)
			: [{ id: "1", name: "Default Collection", entities: [] }];
	});
	const [activeCollectionId, setActiveCollectionId] = useState<string>("1");
	const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
	const [collectedEntities, setCollectedEntities] = useState<
		CollectedEntity[]
	>([]);
	const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
		const savedThemeMode = localStorage.getItem("themeMode") as ThemeMode;
		return savedThemeMode || "auto";
	});
	const [searchWhileTyping, setSearchWhileTyping] = useState<boolean>(() => {
		const savedSearchWhileTyping =
			localStorage.getItem("searchWhileTyping");
		return savedSearchWhileTyping
			? JSON.parse(savedSearchWhileTyping)
			: true;
	});

	useEffect(() => {
		localStorage.setItem("collections", JSON.stringify(collections));
	}, [collections]);

	useEffect(() => {
		localStorage.setItem("themeMode", themeMode);
		updateTheme(themeMode);
	}, [themeMode]);

	useEffect(() => {
		localStorage.setItem(
			"searchWhileTyping",
			JSON.stringify(searchWhileTyping)
		);
	}, [searchWhileTyping]);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => {
			if (themeMode === "auto") {
				updateTheme("auto");
			}
		};
		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [themeMode]);

	useEffect(() => {
		const {
			ids: sharedIds,
			title: sharedTitle,
			collections: sharedCollections,
		} = parseSharedIds(window.location.href);

		if (sharedCollections) {
			const newCollections: Collection[] = sharedCollections.map(
				(sharedCollection, index) => ({
					id: Date.now().toString() + index,
					name: sharedCollection.name,
					entities: sharedCollection.ids.map((id) => ({
						id,
						display_name: "Loading...",
						type: "unknown",
						related_nodes: [],
					})),
				})
			);
			setCollections(newCollections);
			setActiveCollectionId(newCollections[0].id);
		} else if (sharedIds) {
			let targetCollection: Collection;
			if (sharedTitle) {
				targetCollection = collections.find(
					(c) => c.name === sharedTitle
				) || {
					id: Date.now().toString(),
					name: sharedTitle,
					entities: [],
				};
				if (!collections.some((c) => c.id === targetCollection.id)) {
					setCollections((prevCollections) => [
						...prevCollections,
						targetCollection,
					]);
				}
			} else {
				targetCollection =
					collections.find((c) => c.id === activeCollectionId) ||
					collections[0];
			}

			const mergedEntities = mergeSharedIds(
				targetCollection.entities,
				sharedIds
			);
			setCollections((prevCollections) =>
				prevCollections.map((c) =>
					c.id === targetCollection.id
						? { ...c, entities: mergedEntities }
						: c
				)
			);
			setActiveCollectionId(targetCollection.id);
		}
	}, [activeCollectionId]);

	useEffect(() => {
		const fetchEntityDetails = async (collection: Collection) => {
			for (const entity of collection.entities) {
				try {
					const entityDetails = await getEntityDetails(entity.id);
					const relatedNodes = await getRelatedEntities(entity.id);
					setCollections((prevCollections) => {
						return prevCollections.map((c) => {
							if (c.id === collection.id) {
								return {
									...c,
									entities: c.entities.map((e) => {
										if (e.id === entity.id) {
											return {
												...entityDetails,
												related_nodes: relatedNodes.map(
													(node) => ({
														...node,
														type: node.entity_type,
													})
												),
												id: entity.id,
												display_name:
													entity.display_name,
												type: entity.type,
											};
										}
										return e;
									}),
								};
							}
							return c;
						});
					});
				} catch (error) {
					console.error(
						`Error fetching details for entity ${entity.id}:`,
						error
					);
				}
			}
		};

		collections.forEach((collection) => {
			fetchEntityDetails(collection);
		});
	}, [collections]);

	const updateTheme = (mode: ThemeMode) => {
		if (
			mode === "dark" ||
			(mode === "auto" &&
				window.matchMedia("(prefers-color-scheme: dark)").matches)
		) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	};

	const cycleTheme = () => {
		const modes: ThemeMode[] = ["light", "dark", "auto"];
		const currentIndex = modes.indexOf(themeMode);
		const nextMode = modes[(currentIndex + 1) % modes.length];
		setThemeMode(nextMode);
	};

	const toggleSearchWhileTyping = () => {
		setSearchWhileTyping((prev) => !prev);
	};

	const exportCollections = () => {
		const dataStr = JSON.stringify(collections);
		const dataUri =
			"data:application/json;charset=utf-8," +
			encodeURIComponent(dataStr);
		const exportFileDefaultName = "collections.json";
		const linkElement = document.createElement("a");
		linkElement.setAttribute("href", dataUri);
		linkElement.setAttribute("download", exportFileDefaultName);
		linkElement.click();
	};

	const importAndMergeCollections = (importedCollections: Collection[]) => {
		setCollections((prevCollections) => {
			const mergedCollections = [...prevCollections];
			importedCollections.forEach((importedCollection) => {
				const existingCollectionIndex = mergedCollections.findIndex(
					(c) => c.name === importedCollection.name
				);
				if (existingCollectionIndex !== -1) {
					mergedCollections[existingCollectionIndex].entities = [
						...mergedCollections[existingCollectionIndex].entities,
						...importedCollection.entities.filter(
							(entity) =>
								!mergedCollections[
									existingCollectionIndex
								].entities.some((e) => e.id === entity.id)
						),
					];
				} else {
					mergedCollections.push({
						...importedCollection,
						id:
							Date.now().toString() +
							Math.random().toString(36).substr(2, 9),
					});
				}
			});
			return mergedCollections;
		});
	};

	const importAndReplaceCollections = (importedCollections: Collection[]) => {
		setCollections(
			importedCollections.map((collection) => ({
				...collection,
				id:
					Date.now().toString() +
					Math.random().toString(36).substr(2, 9),
			}))
		);
		setActiveCollectionId(importedCollections[0]?.id || "1");
	};

	const clearAllCollections = () => {
		setCollections([{ id: "1", name: "Default Collection", entities: [] }]);
		setActiveCollectionId("1");
	};

	const createNewCollection = () => {
		const newCollection: Collection = {
			id: Date.now().toString(),
			name: `New Collection ${collections.length + 1}`,
			entities: [],
		};
		setCollections([...collections, newCollection]);
		setActiveCollectionId(newCollection.id);
	};

	const mergeCollections = (collectionIds: string[]) => {
		const collectionsToMerge = collections.filter((c) =>
			collectionIds.includes(c.id)
		);
		const mergedEntities = collectionsToMerge.flatMap((c) => c.entities);
		const uniqueEntities = Array.from(
			new Set(mergedEntities.map((e) => e.id))
		).map((id) => mergedEntities.find((e) => e.id === id)!);

		const newCollection: Collection = {
			id: Date.now().toString(),
			name: `Merged Collection`,
			entities: uniqueEntities,
		};

		setCollections((prevCollections) => [
			...prevCollections.filter((c) => !collectionIds.includes(c.id)),
			newCollection,
		]);
		setActiveCollectionId(newCollection.id);
	};

	const cloneCollection = (collectionId: string) => {
		const collectionToClone = collections.find(
			(c) => c.id === collectionId
		);
		if (collectionToClone) {
			const clonedCollection: Collection = {
				...collectionToClone,
				id: Date.now().toString(),
				name: `${collectionToClone.name} (Clone)`,
			};
			setCollections([...collections, clonedCollection]);
			setActiveCollectionId(clonedCollection.id);
		}
	};

	const splitCollection = (collectionId: string, entityIds: string[]) => {
		const collectionToSplit = collections.find(
			(c) => c.id === collectionId
		);
		if (collectionToSplit) {
			const remainingEntities = collectionToSplit.entities.filter(
				(e) => !entityIds.includes(e.id)
			);
			const splitEntities = collectionToSplit.entities.filter((e) =>
				entityIds.includes(e.id)
			);

			const updatedCollection: Collection = {
				...collectionToSplit,
				entities: remainingEntities,
			};

			const newCollection: Collection = {
				id: Date.now().toString(),
				name: `${collectionToSplit.name} (Split)`,
				entities: splitEntities,
			};

			setCollections((prevCollections) => [
				...prevCollections.filter((c) => c.id !== collectionId),
				updatedCollection,
				newCollection,
			]);
			setActiveCollectionId(newCollection.id);
		}
	};

	return (
		<AppContext.Provider
			value={{
				searchResults,
				setSearchResults,
				collections,
				setCollections,
				activeCollectionId,
				setActiveCollectionId,
				selectedEntity,
				setSelectedEntity,
				exportCollections,
				importAndMergeCollections,
				importAndReplaceCollections,
				clearAllCollections,
				createNewCollection,
				mergeCollections,
				cloneCollection,
				collectedEntities,
				setCollectedEntities,
				themeMode,
				cycleTheme,
				searchWhileTyping,
				toggleSearchWhileTyping,
				splitCollection,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};

export const useAppContext = () => {
	const context = useContext(AppContext);
	if (context === undefined) {
		throw new Error("useAppContext must be used within an AppProvider");
	}
	return context;
};
