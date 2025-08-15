/**
 * Questions Page
 * --------------
 * Purpose:
 * Renders the Questions library page: hero header, filters, list of questions,
 * and dialogs for creating, copying-as-new, and editing questions.
 *
 * Responsibilities:
 * - Hold UI state (filters, dialog visibility, selected/copy question draft).
 * - Delegate listing/pagination/data-fetching to <QuestionsList/>.
 * - Open Create/Edit dialogs with <CreateQuestionForm/>.
 * - Allow cloning an existing question as a new draft via "Copy as New".
 *
 * Key Children:
 * - <QuestionFilters/>: controls { grades, subjects, type } and exposes clear-all.
 * - <QuestionsList/>: displays questions (handles pagination/fetching internally).
 * - <CreateQuestionForm/>: used for create, edit, and copy-as-new flows.
 *
 * External Dependencies:
 * - MUI (layout, components, theming), i18n (translations), React Router (N/A here).
 *
 * Data flow (high-level):
 * - Filters state lives here and is passed to <QuestionsList/>.
 * - <QuestionsList/> calls onCopyAsNew(question) to trigger copy-as-new dialog.
 * - Create/Edit dialogs mount <CreateQuestionForm/> with the relevant initial data.
 */

import { useState } from "react";
import {
	Box,
	Button,
	Dialog,
	Paper,
	Typography,
	Avatar,
	Container,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Add as AddIcon, Quiz as QuestionIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import QuestionsList from "../../components/QuestionsList/QuestionsList";
import CreateQuestionForm from "../../components/CreateQuestionForm/CreateQuestionForm";
import QuestionFilters from "../../components/QuestionFilters/QuestionFilters";

export default function Questions() {
	const theme = useTheme();
	const { t } = useTranslation();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [selectedQuestion, setSelectedQuestion] = useState(null);
	const [copyAsNewQuestion, setCopyAsNewQuestion] = useState(null);
	const [filters, setFilters] = useState({
		grades: [],
		subjects: [],
		type: "", // "" for all, "single", "multiple", or "text"
	});

	/**
   * Create a "copy-as-new" draft from an existing question.
   * Strips identifiers and timestamps, prefixes the title with "Copy of".
   *
   * @param {Question} question - The original question to clone
   */
	const handleCopyAsNew = (question) => {
		// Create a copy of the question without the ID and timestamps
		const questionCopy = {
			...question,
			_id: undefined,
			id: undefined,
			createdAt: undefined,
			updatedAt: undefined,
			title: `${t("common.copy")} ${t("common.of")} ${
				question.title || t("navbar.questions")
			}`,
		};
		setCopyAsNewQuestion(questionCopy);
	};

	return (
		<Container maxWidth="xl" sx={{ py: 3 }}>
			{/* Hero Header */}
			<Paper
				elevation={3}
				sx={{
					p: 4,
					mb: 4,
					borderRadius: 3,
					background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
					color: theme.palette.secondary.contrastText,
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
							<QuestionIcon sx={{ fontSize: 36 }} />
						</Avatar>
						<Box>
							<Typography variant="h3" fontWeight="bold" gutterBottom>
								{t("questions.title")}
							</Typography>
							<Typography variant="h6" sx={{ opacity: 0.9 }}>
								{t("questions.subtitle")}
							</Typography>
						</Box>
					</Box>
					<Button
						variant="contained"
						size="large"
						startIcon={<AddIcon />}
						onClick={() => setIsCreateDialogOpen(true)}
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
						{t("questions.createNew")}
					</Button>
				</Box>
			</Paper>

			{/* Filters Section */}
			<Box sx={{ mb: 3 }}>
				<QuestionFilters
					filters={filters}
					onFilterChange={setFilters}
					onClearFilters={() =>
						setFilters({ grades: [], subjects: [], type: "" })
					}
				/>
			</Box>

			{/* Questions List */}
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
						{t("questions.questionLibrary")}
					</Typography>
				</Box>
				<Box sx={{ p: 3 }}>
					<QuestionsList filters={filters} onCopyAsNew={handleCopyAsNew} />
				</Box>
			</Paper>

			{/* Create Question Dialog */}
			<Dialog
				open={isCreateDialogOpen}
				onClose={() => setIsCreateDialogOpen(false)}
				maxWidth="lg"
				fullWidth
			>
				<CreateQuestionForm onClose={() => setIsCreateDialogOpen(false)} />
			</Dialog>

			{/* Copy as New Question Dialog */}
			<Dialog
				open={!!copyAsNewQuestion}
				onClose={() => setCopyAsNewQuestion(null)}
				maxWidth="lg"
				fullWidth
			>
				{copyAsNewQuestion && (
					<CreateQuestionForm
						question={copyAsNewQuestion}
						onClose={() => setCopyAsNewQuestion(null)}
					/>
				)}
			</Dialog>

			{/* Edit Question Dialog */}
			<Dialog
				open={!!selectedQuestion}
				onClose={() => setSelectedQuestion(null)}
				maxWidth="lg"
				fullWidth
			>
				{selectedQuestion && (
					<CreateQuestionForm
						question={selectedQuestion}
						onClose={() => setSelectedQuestion(null)}
					/>
				)}
			</Dialog>
		</Container>
	);
}
