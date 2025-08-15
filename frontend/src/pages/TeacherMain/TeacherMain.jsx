/**
 * TeacherMain Component
 *
 * This is the main dashboard view for teachers.
 * It acts as a container for the Calendar component, which
 * displays scheduled tests, events, or other relevant dates.
 *
 * Structure:
 * - Uses MUI's Box component as a wrapper for layout consistency.
 * - Contains the Calendar component, which handles its own
 *   internal state, events, and rendering logic.
 *
 * Styling:
 * - Imports "TeacherMain.css" for additional custom styles.
 */

import { Box } from "@mui/material";
import Calendar from "../../components/Calendar";
import "./TeacherMain.css";

export default function TeacherMain() {
	return (
		<Box>
			<Calendar />
		</Box>
	);
}
