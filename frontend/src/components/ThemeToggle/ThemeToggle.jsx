/**
 * ThemeToggle Component
 * 
 * This component renders a toggle button to switch between dark and light themes.
 * It uses a custom ThemeContext hook to manage theme state.
 */

import { IconButton, Tooltip } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useTheme } from "../../contexts/ThemeContext";

export default function ThemeToggle() {
	const { isDarkMode, toggleTheme } = useTheme();

	return (
		<Tooltip title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}>
			<IconButton onClick={toggleTheme} color="inherit">
				{isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
			</IconButton>
		</Tooltip>
	);
}
