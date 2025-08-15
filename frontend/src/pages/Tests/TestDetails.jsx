/**
 * TestDetails Component
 * ---------------------
 * Purpose:
 * - Displays details for a specific test and provides a preview option in a dialog.
 *
 * Main Features:
 * 1. **State Management:**
 *    - `showPreview` (boolean): Controls the visibility of the preview dialog.
 *    - `test` (object|null): Placeholder for the test data to be previewed.
 *
 * 2. **UI & Interaction:**
 *    - A "Preview Test" button opens the test preview dialog.
 *    - The dialog contains the `TestPreview` component in preview mode (`TEST_VIEW_MODES.PREVIEW`).
 *    - The dialog can be closed by user interaction.
 *
 * 3. **Dependencies:**
 *    - React `useState` for local state management.
 *    - Material UI components (`Box`, `Button`, `Dialog`) for layout and modal functionality.
 *    - `TestPreview` component for rendering test details.
 *    - `TEST_VIEW_MODES` enum to specify the preview mode.
 *
 * Notes:
 * - The `test` state is currently set to `null` and should be populated with actual test data.
 *
 * Author: [Your Name]
 * Last Updated: [Date]
 */

import { useState } from "react";
import { Box, Button, Dialog } from "@mui/material";
import TestPreview from "../../components/TestPreview/TestPreview";
import { TEST_VIEW_MODES } from "../../components/TestPreview/TestPreview";

export default function TestDetails() {
	const [showPreview, setShowPreview] = useState(false);
	const [test] = useState(null); // Placeholder for test data

	return (
		<Box>
			<Button onClick={() => setShowPreview(true)}>Preview Test</Button>

			<Dialog
				open={showPreview}
				onClose={() => setShowPreview(false)}
				maxWidth="lg"
				fullWidth
			>
				<TestPreview test={test} mode={TEST_VIEW_MODES.PREVIEW} />
			</Dialog>
		</Box>
	);
}
