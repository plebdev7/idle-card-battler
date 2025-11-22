import { GameDebugView } from "./components/GameDebugView";
import { useGameLoop } from "./gameLoop";

function App() {
	useGameLoop();

	return <GameDebugView />;
}

export default App;
