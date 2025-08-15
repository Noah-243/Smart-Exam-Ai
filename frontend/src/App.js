import Login from "./pages/Login/Login";
import Navbar from "./components/Navbar";
import UserProvider from "./contexts/UserContext";

const App = () => {
	return (
		<UserProvider>
			<div className="App">
				<Navbar />
				<Login />
			</div>
		</UserProvider>
	);
};

export default App;
