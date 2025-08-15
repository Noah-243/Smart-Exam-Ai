/**
 * App.jsx
 *
 * Main application component that wraps the entire app with providers:
 * - ThemeProvider
 * - LanguageProvider
 * - UserProvider
 * - React Query Client
 * - MUI + Date Adapter
 * - Router
 * 
 * Also includes an InactivityHandler that logs the user out after inactivity.
 */

import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CssBaseline, Box } from "@mui/material";
import { ThemeProvider } from "./contexts/ThemeContext";
import UserProvider from "./contexts/UserContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import { SnackbarProvider } from "notistack";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useEffect } from "react";

// Create React Query client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
		},
	},
});

/**
 * InactivityHandler
 *
 * Logs the user out after 20 seconds of inactivity.
 * Listens for common activity events and resets the timer on activity.
 */
function InactivityHandler() {
	useEffect(() => {
		let timeout = setTimeout(() => {
			localStorage.clear();
			sessionStorage.clear();
			window.location.href = "/login";
		}, 10 * 60 * 1000); 

		const resetTimer = () => {
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				localStorage.clear();
				sessionStorage.clear();
				window.location.href = "/login";
			},10 * 60 * 1000); 
		};

		const events = ["mousemove", "keydown", "scroll", "touchstart"];
		events.forEach((event) => window.addEventListener(event, resetTimer));

		return () => {
			events.forEach((event) => window.removeEventListener(event, resetTimer));
			clearTimeout(timeout);
		};
	}, []);

	return null;
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>
				<LanguageProvider>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<CssBaseline />
						<SnackbarProvider maxSnack={3}>
							<BrowserRouter>
								<UserProvider>
									<Box
										sx={{
											bgcolor: "background.default",
											minHeight: "100vh",
											display: "flex",
											flexDirection: "column",
										}}
									>
										<Navbar />
										<InactivityHandler /> {/* ⬅️ This enables auto-logout after inactivity */}
										<Box sx={{ flexGrow: 1 }}>
											<AppRoutes />
										</Box>
									</Box>
								</UserProvider>
							</BrowserRouter>
						</SnackbarProvider>
					</LocalizationProvider>
				</LanguageProvider>
			</ThemeProvider>
		</QueryClientProvider>
	);
}

export default App;
