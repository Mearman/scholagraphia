import { PropsWithChildren } from "react";
import { useCollections } from "./api/useCollections";
import { CollectionListProvider } from "./contexts/CollectionListContext";

type AppProviderProps = PropsWithChildren;
const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
	const collections = useCollections();
	return <CollectionListProvider collectionsHook={collections}>{children}</CollectionListProvider>;
};

export default AppProvider;
