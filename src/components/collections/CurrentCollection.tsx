import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../AppContext";
import { useCollectionListContext } from "../../contexts/CollectionListContext";
import { getEntityTypeFromId } from "../../util/GetEntityTypeFromId";
import { Sidebar } from "../Sidebar";
import { ItemDetails } from "./ItemDetails.tsx";

export function CurrentCollection() {
	const { activeCollection, handleRemoveFromCollection } = useCollectionListContext();
	const { fetchWithCache } = useContext(AppContext);
	const [itemDetails, setItemDetails] = useState<ItemDetails[]>([]);

	useEffect(() => {
		const fetchItemDetails = async () => {
			if (activeCollection) {
				const details = await Promise.all(
					activeCollection.items.map(async (id) => {
						const type = getEntityTypeFromId(id);
						const url = `https://api.openalex.org/${type.toLowerCase()}s/${id}`;
						const response = await fetchWithCache(url);
						const data = await response.json();
						return {
							id: data.id,
							display_name: data.display_name,
							relevance_score: 0,
							type,
							...data,
						};
					})
				);
				setItemDetails(details);
			} else {
				setItemDetails([]);
			}
		};

		fetchItemDetails();
	}, [activeCollection, fetchWithCache]);

	const handleRemove = (id: string) => {
		handleRemoveFromCollection(id);
		setItemDetails((prevDetails) => prevDetails.filter((item) => item.id !== id));
	};

	return (
		<Sidebar side="right">
			<h2>Collected Items</h2>
			{activeCollection ? (
				<div>
					<h3>{activeCollection.name}</h3>
					<p>Items: {itemDetails.length}</p>
					{activeCollection.items.map((itemID) => (
						<ItemDetails itemId={itemID} />
					))}
				</div>
			) : (
				<p>No collection selected</p>
			)}
		</Sidebar>
	);
}
