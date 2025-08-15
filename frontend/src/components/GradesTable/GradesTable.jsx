/**
 * GradesTable Component
 *
 * Description:
 * This component renders a dynamic and interactive table of grades using Material UI's DataGrid.
 * It includes filtering by level and name, displays student counts per grade,
 * and supports editing and deleting grades via a modal form and actions column.
 *
 * Props:
 * - grades: {
 *     items: Array of grade objects (each containing _id, name, level),
 *     levels: Array of available grade levels
 *   }
 *
 * Features:
 * - Fetches and displays real-time student counts per grade from `/api/grades/student-counts`
 *   with retry logic (up to 3 attempts)
 * - Allows filtering the table by grade level and search query (grade name)
 * - Supports editing and deleting grades using a modal (`GradeForm`) and React Query mutations
 * - Displays actions (edit/delete) per grade row with tooltips
 * - Uses i18n translation (via useTranslation) for labels and messages
 *
 * Hooks:
 * - useState: Manages modal open state, selected grade, filters, and local grade data
 * - useEffect: Triggers fetching of student counts on mount or when grade list changes
 * - useMutation (React Query): Handles grade deletion with cache invalidation
 * - useQueryClient (React Query): Used to refresh dashboard data on changes
 *
 * UI Components:
 * - MUI DataGrid with built-in toolbar
 * - Form controls for filtering (Select and TextField)
 * - Dialog form (`GradeForm`) for creating or updating grades
 * - Material UI components (Button, Tooltip, Chip, IconButton, etc.)
 *
 * Notes:
 * - Grade deletion is confirmed using a browser confirmation dialog.
 * - Chip component shows number of students with color change depending on count.
 */

import { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
	Box,
	Button,
	IconButton,
	Tooltip,
	TextField,
	Stack,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Chip,
} from "@mui/material";
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	Add as AddIcon,
	Person as PersonIcon,
} from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGrade } from "../../api/grades";
import GradeForm from "../GradeForm/GradeForm";
import { useTranslation } from "react-i18next";

export default function GradesTable({ grades = { items: [], levels: [] } }) {
	const { t } = useTranslation();
	const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
	const [selectedGrade, setSelectedGrade] = useState(null);
	const queryClient = useQueryClient();
	const [filters, setFilters] = useState({
		level: "all",
		search: "",
	});
	const [gradesWithCounts, setGradesWithCounts] = useState(grades.items);

	// Fetch student counts directly with retries
	useEffect(() => {
		const fetchStudentCounts = async (retryCount = 0) => {
			try {
				// Get the auth token
				let token = "";
				try {
					const storedData = localStorage.getItem("SES-USER");
					if (storedData) {
						const parsed = JSON.parse(storedData);
						token = parsed.token || "";
					}
				} catch (e) {
					console.error("Error reading token:", e);
				}

				console.log(
					`Attempt ${retryCount + 1} to fetch student counts, auth:`,
					token ? "Token present" : "No token"
				);

				// Force the API call to go through
				const response = await fetch("/api/grades/student-counts", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: token ? `Bearer ${token}` : "",
					},
				});

				console.log("Student counts response status:", response.status);

				if (response.ok) {
					const data = await response.json();
					console.log("Successfully fetched student counts:", data);

					if (data.success && data.data) {
						const countMap = {};
						data.data.forEach((item) => {
							countMap[item._id] = item.studentCount;
							console.log(
								`Grade ${item._id} has ${item.studentCount} students`
							);
						});

						const updatedGrades = grades.items.map((grade) => {
							const count = countMap[grade._id] || 0;
							console.log(`Setting count for ${grade.name}: ${count}`);
							return {
								...grade,
								studentCount: count,
							};
						});

						setGradesWithCounts(updatedGrades);
					} else {
						console.error("Invalid response format:", data);
					}
				} else {
					console.error(
						"Failed to fetch student counts:",
						response.status,
						response.statusText
					);

					// Retry logic (up to 3 times)
					if (retryCount < 3) {
						console.log(`Retrying in ${(retryCount + 1) * 1000}ms...`);
						setTimeout(() => {
							fetchStudentCounts(retryCount + 1);
						}, (retryCount + 1) * 1000);
					}
				}
			} catch (error) {
				console.error("Error directly fetching student counts:", error);

				// Retry logic (up to 3 times)
				if (retryCount < 3) {
					console.log(
						`Retrying after error in ${(retryCount + 1) * 1000}ms...`
					);
					setTimeout(() => {
						fetchStudentCounts(retryCount + 1);
					}, (retryCount + 1) * 1000);
				}
			}
		};

		if (grades.items.length > 0) {
			fetchStudentCounts();
		}
	}, [grades.items]);

	const { mutate: removeGrade } = useMutation({
		mutationFn: deleteGrade,
		onSuccess: () => {
			queryClient.invalidateQueries(["dashboard"]);
			queryClient.invalidateQueries(["studentCounts"]);
		},
	});

	const filteredGrades = gradesWithCounts.filter((grade) => {
		const matchesLevel =
			filters.level === "all" || grade.level.toString() === filters.level;
		const matchesSearch = grade.name
			.toLowerCase()
			.includes(filters.search.toLowerCase());
		return matchesLevel && matchesSearch;
	});

	const handleFilterChange = (event) => {
		const { name, value } = event.target;
		setFilters((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const levels = grades.levels.map((level) => level.toString());

	const handleDeleteGrade = async (gradeId) => {
		if (window.confirm(t("admin.confirmDeleteGrade"))) {
			try {
				await removeGrade(gradeId);
			} catch (error) {
				console.error("Error deleting grade:", error);
			}
		}
	};

	const columns = [
		{ field: "name", headerName: t("grades.gradeName"), flex: 1 },
		{ field: "level", headerName: t("grades.level"), flex: 1 },
		{
			field: "studentCount",
			headerName: t("grades.students"),
			flex: 1,
			renderCell: (params) => (
				<Chip
					icon={<PersonIcon />}
					label={params.value || 0}
					color={params.value > 0 ? "primary" : "default"}
					variant="outlined"
					size="small"
				/>
			),
		},
		{
			field: "actions",
			headerName: t("common.actions"),
			flex: 1,
			sortable: false,
			renderCell: (params) => (
				<Box>
					<Tooltip title={t("common.edit")}>
						<IconButton
							onClick={() => {
								setSelectedGrade(params.row);
								setIsGradeModalOpen(true);
							}}
						>
							<EditIcon />
						</IconButton>
					</Tooltip>
					<Tooltip title={t("common.delete")}>
						<IconButton onClick={() => handleDeleteGrade(params.row._id)}>
							<DeleteIcon />
						</IconButton>
					</Tooltip>
				</Box>
			),
		},
	];

	return (
		<Box sx={{ height: 600, width: "100%" }}>
			<Stack
				direction="row"
				spacing={2}
				sx={{ mb: 2 }}
				alignItems="center"
				justifyContent="space-between"
			>
				<Stack direction="row" spacing={2}>
					<FormControl sx={{ minWidth: 120 }}>
						<InputLabel>{t("grades.level")}</InputLabel>
						<Select
							name="level"
							value={filters.level}
							onChange={handleFilterChange}
							label={t("grades.level")}
							size="small"
						>
							<MenuItem value="all">{t("grades.allLevels")}</MenuItem>
							{levels.map((level) => (
								<MenuItem key={level} value={level}>
									{t("grades.level")} {level}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<TextField
						name="search"
						value={filters.search}
						onChange={handleFilterChange}
						placeholder={t("grades.searchGrades")}
						size="small"
					/>
				</Stack>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => {
						setSelectedGrade(null);
						setIsGradeModalOpen(true);
					}}
				>
					{t("grades.addGrade")}
				</Button>
			</Stack>
			<DataGrid
				rows={filteredGrades}
				columns={columns}
				pageSize={10}
				rowsPerPageOptions={[10, 25, 50]}
				checkboxSelection
				disableSelectionOnClick
				getRowId={(row) => row._id}
				components={{
					Toolbar: GridToolbar,
				}}
			/>
			<GradeForm
				open={isGradeModalOpen}
				onClose={() => {
					setIsGradeModalOpen(false);
					setSelectedGrade(null);
				}}
				grade={selectedGrade}
			/>
		</Box>
	);
}
