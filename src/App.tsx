import "./App.css";
import { AppContextProvider } from "./AppContext";
import AppProvider from "./AppProvider";
import Content from "./Content";

export function App(): JSX.Element {
	return (
		<AppContextProvider>
			<AppProvider>
				<Content />
			</AppProvider>
		</AppContextProvider>
	);
}

export default App;
