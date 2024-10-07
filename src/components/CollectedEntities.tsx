import { FileDown, FileUp, MoreVertical, Trash2, Upload } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import EntityCard from "./EntityCard";

interface CollectedEntitiesProps {
	onShowRelated: (relatedIds: string) => void;
}

const CollectedEntities: React.FC<CollectedEntitiesProps> = ({
	onShowRelated,
}) => {
	const {
		collections,
		setCollections,
		activeCollectionId,
		exportCollections,
		importAndMergeCollections,
		importAndReplaceCollections,
		clearAllCollections,
	} = useAppContext();

	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	const activeCollection = collections.find(
		(c) => c.id === activeCollectionId
	);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				setIsMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleRemove = (id: string) => {
		setCollections(
			collections.map((collection) =>
				collection.id === activeCollectionId
					? {
							...collection,
							entities: collection.entities.filter(
								(entity) => entity.id !== id
							),
					  }
					: collection
			)
		);
	};

	const handleImport = (
		event: React.ChangeEvent<HTMLInputElement>,
		replace: boolean
	) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result as string;
				try {
					const importedCollections = JSON.parse(content);
					if (replace) {
						importAndReplaceCollections(importedCollections);
					} else {
						importAndMergeCollections(importedCollections);
					}
				} catch (error) {
					console.error("Error parsing imported file:", error);
					alert(
						"Error importing file. Please make sure it's a valid JSON file."
					);
				}
			};
			reader.readAsText(file);
		}
	};

	return (
		<div className="mt-8">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
					{activeCollection
						? activeCollection.name
						: "No Collection Selected"}
				</h2>
				<div className="relative" ref={menuRef}>
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
					>
						<MoreVertical
							size={20}
							className="text-gray-600 dark:text-gray-400"
						/>
					</button>
					{isMenuOpen && (
						<div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
							<div className="py-1">
								<button
									onClick={exportCollections}
									className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
								>
									<FileDown size={16} className="mr-2" />
									Export All Collections
								</button>
								<label className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full cursor-pointer">
									<FileUp size={16} className="mr-2" />
									Import and Merge
									<input
										type="file"
										accept=".json"
										onChange={(e) => handleImport(e, false)}
										className="hidden"
									/>
								</label>
								<label className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full cursor-pointer">
									<Upload size={16} className="mr-2" />
									Import and Replace
									<input
										type="file"
										accept=".json"
										onChange={(e) => handleImport(e, true)}
										className="hidden"
									/>
								</label>
								<button
									onClick={clearAllCollections}
									className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
								>
									<Trash2 size={16} className="mr-2" />
									Clear All Collections
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
			{activeCollection &&
				activeCollection.entities.map((entity) => (
					<EntityCard
						key={entity.id}
						entity={entity}
						showCollectButton={false}
						onRemove={() => handleRemove(entity.id)}
						onShowRelated={onShowRelated}
					/>
				))}
			{(!activeCollection || activeCollection.entities.length === 0) && (
				<p className="text-gray-600 dark:text-gray-400">
					No entities collected in this collection yet.
				</p>
			)}
		</div>
	);
};

export default CollectedEntities;
