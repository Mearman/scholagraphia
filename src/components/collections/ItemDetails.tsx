import { ReactElement, useContext, useEffect, useState } from "react";
import { AppContext } from "../../AppContext.tsx";
import { useCollectionListContext } from "../../contexts/CollectionListContext.tsx";
import { Result, typeFromUri } from "../../types";

export interface ItemDetails extends Result {
	type: string;
}

export function ItemDetails({ itemId }: { itemId: string }): ReactElement {
	const { fetchWithCache } = useContext(AppContext);
	const [item, setItem] = useState<Record<string, string> | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { handleRemoveFromCollection: handleRemove } = useCollectionListContext();

	const fetchItem = async () => {
		setIsLoading(true);
		setError(null);
		try {
			console.debug("Fetching item details for", itemId);
			const url = `https://api.openalex.org/${itemId}`;
			const response = await fetchWithCache(url);
			const data = await response.json();
			setItem(data);
		} catch (error) {
			setError("Error fetching item details");
		}
		setIsLoading(false);
	};

	useEffect(() => {
		fetchItem();
	}, [itemId]);

	if (isLoading) {
		return <p>Loading...</p>;
	}

	if (error) {
		return <p>{error}</p>;
	}

	if (!item) {
		return <p>Item not found</p>;
	}

	return (
		<div className="collected-item">
			<h4>{item.display_name}</h4>
			<p>Type: {typeFromUri(item.id)}</p>
			<button onClick={() => handleRemove(item.id)}>Remove</button>
		</div>
	);
}
