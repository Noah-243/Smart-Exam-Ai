/**
 * Tests Page Component
 * 
 * This page serves as the central hub for managing tests in the teacher's interface.
 * It provides:
 *  - A hero header with actions to create a new test or generate one using AI
 *  - Filtering options for grades and subjects
 *  - A dynamically updated list of tests fetched from the backend
 *  - Dialogs for creating, editing, copying, and AI-assisted test creation
 * 
 * Key Features:
 *  1. **Data Fetching**:
 *     - Uses React Query (`useQuery`) to retrieve the list of tests from the backend via `getTests`.
 * 
 *  2. **Filtering**:
 *     - Uses the `TestFilters` component to filter tests by grade and subject.
 *     - Filters are stored in `filters` state and applied to the fetched data.
 * 
 *  3. **Dialog Management**:
 *     - Multiple dialogs for different purposes:
 *       - Create Test (`isCreateDialogOpen`)
 *       - Create AI Test (`isAICreateDialogOpen`)
 *       - Copy Test as New (`copyAsNewTest`)
 *       - Edit Test (`selectedTest`)
 * 
 *  4. **UI/UX**:
 *     - Styled with Material UI (MUI) components and theme-aware colors.
 *     - Includes animated button hover effects and a responsive layout.
 * 
 * State Variables:
 *  - `isCreateDialogOpen`: Controls visibility of the create test form.
 *  - `isAICreateDialogOpen`: Controls visibility of the AI test creation form.
 *  - `selectedTest`: Stores the currently selected test for editing.
 *  - `copyAsNewTest`: Stores a duplicate of a test for creating a new one.
 *  - `filters`: Stores active grade/subject filters for the list.
 * 
 * External Components Used:
 *  - `TestsList` – Displays a list of tests with copy/edit options.
 *  - `CreateTestForm` – Form for creating or editing a test.
 *  - `CreateAITestForm` – Form for AI-generated test creation.
 *  - `TestFilters` – Filter controls for grades and subjects.
 * 
 * Dependencies:
 *  - Material UI (MUI) for styling and layout.
 *  - React Query for data fetching and caching.
 *  - React i18next for translations.
 * 
 * Author: [Your Name]
 * Date: [Date]
 */


import { useState } from "react";
import {
	Box,
	Button,
	Dialog,
	Paper,
	Typography,
	Avatar,
	Stack,
	Container,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
	Add as AddIcon,
	AutoAwesome as AiIcon,
	Assignment as TestIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getTests } from "../../api/tests";
import TestsList from "../../components/TestsList/TestsList";
import CreateTestForm from "../../components/CreateTestForm/CreateTestForm";
import CreateAITestForm from "../../components/CreateAITestForm/CreateAITestForm";
import TestFilters from "../../components/TestFilters/TestFilters";

export default function Tests() {
	const theme = useTheme();
	const { t } = useTranslation();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	// Debug logging for dialog state
	console.log("Tests page render - isCreateDialogOpen:", isCreateDialogOpen);
	const [isAICreateDialogOpen, setIsAICreateDialogOpen] = useState(false);
	const [selectedTest, setSelectedTest] = useState(null);
	const [copyAsNewTest, setCopyAsNewTest] = useState(null);
	const [filters, setFilters] = useState({
		grades: [],
		subjects: [],
	});

	const { data: tests } = useQuery({
		queryKey: ["tests"],
		queryFn: getTests,
	});

	const handleCopyAsNew = (test) => {
		// Create a copy of the test without the ID and timestamps
		const testCopy = {
			...test,
			_id: undefined,
			id: undefined,
			createdAt: undefined,
			updatedAt: undefined,
			title: `${t("common.copy")} ${t("common.of")} ${
				test.title || t("navbar.tests")
			}`,
		};
		setCopyAsNewTest(testCopy);
	};

const filteredTests =
		tests?.data?.filter((test) => {
			// Test model has singular 'grade' and 'subject' fields populated from backend
			// Grade uses _id, Subject uses id (due to toJSON transform)
			const matchesGrades =
				filters.grades.length === 0 ||
				(test.grade && filters.grades.includes(test.grade._id));

					console.log("FILTER SUBJECTS:", filters.subjects);
	console.log("TEST SUBJECT:", test.subject);
	
			const matchesSubjects =
				filters.subjects.length === 0 ||
				(test.subject && filters.subjects.includes(test.subject.id));
			return matchesGrades && matchesSubjects;
		}) || [];


	return (
		<Container maxWidth="xl" sx={{ py: 3 }}>
			{/* Hero Header */}
			<Paper
				elevation={3}
				sx={{
					p: 4,
					mb: 4,
					borderRadius: 3,
					background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
					color: theme.palette.primary.contrastText,
					position: "relative",
					overflow: "hidden",
					"&::before": {
						content: '""',
						position: "absolute",
						top: 0,
						right: 0,
						width: "200px",
						height: "200px",
						background: "rgba(255,255,255,0.1)",
						borderRadius: "50%",
						transform: "translate(50%, -50%)",
					},
				}}
			>
				<Box display="flex" alignItems="center" justifyContent="space-between">
					<Box display="flex" alignItems="center">
						<Avatar
							sx={{
								width: 64,
								height: 64,
								bgcolor: "rgba(255,255,255,0.2)",
								mr: 3,
							}}
						>
							<TestIcon sx={{ fontSize: 36 }} />
						</Avatar>
						<Box>
							<Typography variant="h3" fontWeight="bold" gutterBottom>
								{t("tests.title")}
							</Typography>
							<Typography variant="h6" sx={{ opacity: 0.9 }}>
								{t("tests.subtitle")}
							</Typography>
						</Box>
					</Box>
					<Stack direction="row" spacing={2}>
						<Button
							variant="contained"
							size="large"
							startIcon={<AddIcon />}
							onClick={() => {
								console.log("Create Test button clicked");
								setIsCreateDialogOpen(true);
							}}
							sx={{
								bgcolor: "rgba(255,255,255,0.2)",
								color: "inherit",
								borderRadius: 2,
								px: 3,
								py: 1.5,
								fontWeight: "bold",
								textTransform: "none",
								"&:hover": {
									bgcolor: "rgba(255,255,255,0.3)",
									transform: "translateY(-2px)",
									boxShadow: theme.shadows[4],
								},
							}}
						>
							{t("tests.createNew")}
						</Button>
						<Button
							variant="outlined"
							size="large"
							startIcon={<AiIcon />}
							onClick={() => setIsAICreateDialogOpen(true)}
							sx={{
								borderColor: "rgba(255,255,255,0.3)",
								color: "inherit",
								borderRadius: 2,
								px: 3,
								py: 1.5,
								fontWeight: "bold",
								textTransform: "none",
								"&:hover": {
									borderColor: "rgba(255,255,255,0.6)",
									bgcolor: "rgba(255,255,255,0.1)",
									transform: "translateY(-2px)",
								},
							}}
						>
							{t("tests.createWithAI")}
						</Button>
					</Stack>
				</Box>
			</Paper>

			{/* Filters Section */}
			<Box sx={{ mb: 3 }}>
				<TestFilters
					filters={filters}
					onFilterChange={setFilters}
					onClearFilters={() => setFilters({ grades: [], subjects: [] })}
				/>
			</Box>

			{/* Tests List */}
			<Paper
				elevation={2}
				sx={{
					borderRadius: 3,
					border: `1px solid ${theme.palette.divider}`,
					overflow: "hidden",
					minHeight: "60vh",
				}}
			>
				<Box
					sx={{
						p: 2,
						bgcolor: theme.palette.background.elevated,
						borderBottom: `1px solid ${theme.palette.divider}`,
					}}
				>
					<Typography variant="h6" fontWeight="bold">
						{t("tests.testLibrary")} ({filteredTests?.length || 0})
					</Typography>
				</Box>
				<Box sx={{ p: 3 }}>
					<TestsList
						tests={filteredTests || []}
						onCopyAsNew={handleCopyAsNew}
					/>
				</Box>
			</Paper>

			{/* Create Test Dialog */}
			<Dialog
				open={isCreateDialogOpen}
				onClose={() => setIsCreateDialogOpen(false)}
				maxWidth="xl"
				fullWidth
			>
				<CreateTestForm onClose={() => setIsCreateDialogOpen(false)} />
			</Dialog>

			{/* AI Test Creation Dialog */}
			<Dialog
				open={isAICreateDialogOpen}
				onClose={() => setIsAICreateDialogOpen(false)}
				maxWidth="xl"
				fullWidth
			>
				<CreateAITestForm onClose={() => setIsAICreateDialogOpen(false)} />
			</Dialog>

			{/* Copy as New Test Dialog */}
			<Dialog
				open={!!copyAsNewTest}
				onClose={() => setCopyAsNewTest(null)}
				maxWidth="xl"
				fullWidth
			>
				{copyAsNewTest && (
					<CreateTestForm
						test={copyAsNewTest}
						onClose={() => setCopyAsNewTest(null)}
					/>
				)}
			</Dialog>

			{/* Edit Test Dialog */}
			<Dialog
				open={!!selectedTest}
				onClose={() => setSelectedTest(null)}
				maxWidth="xl"
				fullWidth
			>
				{selectedTest && (
					<CreateTestForm
						test={selectedTest}
						onClose={() => setSelectedTest(null)}
					/>
				)}
			</Dialog>
		</Container>
	);
}
