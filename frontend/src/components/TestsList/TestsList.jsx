/**
 * TestsList Component – Displays a table of tests with options to view, edit, copy, or delete.
 *
 * Main Features:
 * - Displays a list of tests using a Material UI table
 * - Allows users to click on a test to open a preview dialog (TestViewDialog)
 * - Enables copying a test as a new one via the "Copy As New" button
 * - Supports editing a test using CreateTestForm
 * - Provides a confirmation dialog for deleting a test (DeleteConfirmationDialog)
 *
 * Props:
 * @param {Array} tests - List of test objects to display
 * @param {Function} onCopyAsNew - Callback to copy a test as new
 *
 * Subcomponents:
 * - TestViewDialog: shows detailed test preview with edit/copy options
 * - DeleteConfirmationDialog: asks the user to confirm test deletion
 *
 * Libraries Used:
 * - Material UI (components, icons)
 * - i18next for translations
 * - PropTypes for prop validation
 */

import { useState } from "react";
import {
	Box,
	Typography,
	Chip,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Stack,
	Avatar,
	Paper,
} from "@mui/material";
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	ContentCopy as CopyIcon,
	Quiz as TestIcon,
	Timer as TimerIcon,
	School as SchoolIcon,
	Book as BookIcon,
	Warning as WarningIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import TestPreview from "../TestPreview/TestPreview";
import { TEST_VIEW_MODES } from "../TestPreview/TestPreview";
import CreateTestForm from "../CreateTestForm/CreateTestForm";
import PropTypes from "prop-types";

// Test View Dialog Component
const TestViewDialog = ({ test, open, onClose, onCopyAsNew }) => {
	const { t } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);

	if (!test) return null;

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleCloseEdit = () => {
		setIsEditing(false);
		onClose();
	};

	const handleCopyAsNew = () => {
		onCopyAsNew(test);
		onClose();
	};

	if (isEditing) {
		return (
			<Dialog open={open} onClose={handleCloseEdit} maxWidth="xl" fullWidth>
				<CreateTestForm test={test} onClose={handleCloseEdit} />
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
			<DialogTitle>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<Avatar
						sx={{
							bgcolor: "primary.main",
							width: 40,
							height: 40,
						}}
					>
						<TestIcon />
					</Avatar>
					<Box sx={{ flexGrow: 1 }}>
						<Typography variant="h6" fontWeight="bold">
							{t("tests.testPreview")}
						</Typography>
						<Box
							sx={{ display: "flex", alignItems: "center", gap: 2, mt: 0.5 }}
						>
							<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
								<TimerIcon fontSize="small" color="action" />
								<Typography variant="body2" color="text.secondary">
									{test.duration} {t("common.minutes")}
								</Typography>
							</Box>
							<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
								<SchoolIcon fontSize="small" color="action" />
								<Typography variant="body2" color="text.secondary">
									{test.grade?.name || t("questions.noGrades")}
								</Typography>
							</Box>
							<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
								<BookIcon fontSize="small" color="action" />
								<Typography variant="body2" color="text.secondary">
									{test.subject?.name || t("questions.noSubjects")}
								</Typography>
							</Box>
						</Box>
					</Box>
				</Box>
			</DialogTitle>

			<DialogContent sx={{ p: 0 }}>
				<TestPreview test={test} mode={TEST_VIEW_MODES.PREVIEW} />
			</DialogContent>

			<DialogActions sx={{ p: 3, pt: 0 }}>
				<Stack direction="row" spacing={2} sx={{ width: "100%" }}>
					<Button onClick={onClose} color="inherit" size="large">
						{t("common.close")}
					</Button>
					<Box sx={{ flexGrow: 1 }} />
					<Button
						onClick={handleCopyAsNew}
						startIcon={<CopyIcon />}
						variant="outlined"
						size="large"
					>
						{t("common.copyAsNew")}
					</Button>
					<Button
						onClick={handleEdit}
						startIcon={<EditIcon />}
						variant="contained"
						size="large"
					>
						{t("tests.editTest")}
					</Button>
				</Stack>
			</DialogActions>
		</Dialog>
	);
};

TestViewDialog.propTypes = {
	test: PropTypes.object,
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onCopyAsNew: PropTypes.func.isRequired,
};

// Delete Confirmation Dialog Component
const DeleteConfirmationDialog = ({
	open,
	onClose,
	onConfirm,
	itemType,
	itemTitle,
}) => {
	const { t } = useTranslation();

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<Avatar
						sx={{
							bgcolor: "error.main",
							width: 40,
							height: 40,
						}}
					>
						<WarningIcon />
					</Avatar>
					<Box>
						<Typography variant="h6" fontWeight="bold">
							{t("common.delete")} {itemType}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{t("tests.deleteWarning")}
						</Typography>
					</Box>
				</Box>
			</DialogTitle>
			<DialogContent>
				<Typography variant="body1">{t("tests.deleteConfirmation")}</Typography>
				{itemTitle && (
					<Paper
						variant="outlined"
						sx={{
							p: 2,
							mt: 2,
							bgcolor: "background.elevated",
							borderRadius: 2,
						}}
					>
						<Typography variant="body2" color="text.secondary" gutterBottom>
							{t("tests.testToBeDeleted")}:
						</Typography>
						<Typography variant="body1" fontWeight="medium">
							{itemTitle}
						</Typography>
					</Paper>
				)}
			</DialogContent>
			<DialogActions sx={{ p: 3, pt: 0 }}>
				<Button onClick={onClose} color="inherit" size="large">
					{t("common.cancel")}
				</Button>
				<Button
					onClick={onConfirm}
					color="error"
					variant="contained"
					size="large"
					startIcon={<DeleteIcon />}
				>
					{t("common.delete")} {itemType}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

DeleteConfirmationDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onConfirm: PropTypes.func.isRequired,
	itemType: PropTypes.string.isRequired,
	itemTitle: PropTypes.string,
};

export default function TestsList({ tests, onCopyAsNew }) {
	const { t } = useTranslation();
	const [selectedTest, setSelectedTest] = useState(null);
	const [viewDialogOpen, setViewDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [testToDelete, setTestToDelete] = useState(null);

	if (!tests?.length) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					p: 3,
				}}
			>
				<Typography>{t("tests.noTests")}</Typography>
			</Box>
		);
	}

	const handleRowClick = (test) => {
		setSelectedTest(test);
		setViewDialogOpen(true);
	};

	const handleDeleteTest = () => {
		// Handle delete functionality
		// Implementation would go here when backend delete endpoint is ready
	};

	return (
		<Box>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>{t("common.title")}</TableCell>
							<TableCell>{t("common.grade")}</TableCell>
							<TableCell>{t("common.subject")}</TableCell>
							<TableCell>{t("common.duration")}</TableCell>
							<TableCell align="right">{t("common.actions")}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{tests.map((test) => (
							<TableRow
								key={test._id}
								onClick={() => handleRowClick(test)}
								sx={{
									cursor: "pointer",
									transition: "all 0.2s ease-in-out",
									"&:hover": {
										backgroundColor: (theme) =>
											theme.palette.mode === "dark"
												? "rgba(255, 255, 255, 0.08)"
												: "rgba(0, 0, 0, 0.04)",
										transform: "translateY(-1px)",
										boxShadow: (theme) => theme.shadows[2],
									},
									"&:active": {
										transform: "translateY(0px)",
									},
								}}
							>
								<TableCell>
									<Typography variant="body2" fontWeight="medium">
										{test.title}
									</Typography>
								</TableCell>
								<TableCell>
									<Chip
										label={test.grade?.name || t("questions.noGrades")}
										size="small"
										variant="outlined"
										color="primary"
									/>
								</TableCell>
								<TableCell>
									<Chip
										label={test.subject?.name || t("questions.noSubjects")}
										size="small"
										variant="outlined"
										color="secondary"
									/>
								</TableCell>
								<TableCell>
									<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
										<TimerIcon fontSize="small" color="action" />
										<Typography variant="body2">
											{test.duration} {t("common.min")}
										</Typography>
									</Box>
								</TableCell>
								<TableCell align="right">
									<Tooltip title={t("common.delete")}>
										<IconButton
											size="small"
											onClick={(e) => {
												e.stopPropagation(); // Prevent row click
												setTestToDelete(test);
												setDeleteDialogOpen(true);
											}}
											sx={{
												color: "error.main",
												"&:hover": {
													backgroundColor: "error.light",
													color: "error.contrastText",
												},
											}}
										>
											<DeleteIcon />
										</IconButton>
									</Tooltip>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<TestViewDialog
				test={selectedTest}
				open={viewDialogOpen}
				onClose={() => setViewDialogOpen(false)}
				onCopyAsNew={onCopyAsNew}
			/>

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmationDialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				onConfirm={() => {
					handleDeleteTest();
					setDeleteDialogOpen(false);
				}}
				itemType={t("navbar.tests")}
				itemTitle={testToDelete?.title}
			/>
		</Box>
	);
}

TestsList.propTypes = {
	tests: PropTypes.array.isRequired,
	onCopyAsNew: PropTypes.func.isRequired,
};
