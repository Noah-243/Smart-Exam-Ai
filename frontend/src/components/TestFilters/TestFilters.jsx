/**
 * TestFilters.jsx
 *
 * This component provides a collapsible filter panel for selecting test filters
 * by grade level and subject. It is designed to be used in pages that display test lists
 * or dashboards where filtering by academic attributes is required.
 *
 * Component Purpose:
 * - Allow users to filter tests based on selected grades and subjects.
 * - Show active filters as removable chips.
 * - Toggle visibility of filter options with expand/collapse.
 * - Display a count of active filters using a badge.
 *
 * Props:
 * - filters (object, required): An object containing:
 *   - grades (array of strings): List of selected grade IDs.
 *   - subjects (array of strings): List of selected subject IDs.
 *
 * - onFilterChange (function, required): Callback when filters are updated.
 *   Receives the new filters object as an argument.
 *
 * - onClearFilters (function, required): Callback to clear all active filters.
 *
 * Technologies Used:
 * - React (functional component with useState)
 * - Material UI: Paper, Box, Typography, Chip, Checkbox, Avatar, Badge, Collapse
 * - MUI Icons: FilterList, Clear, ExpandMore, ExpandLess, Grade, Subject
 * - React Query (`useQuery`) to fetch grades and subjects
 * - `react-i18next` for translations
 *
 * Internal Functions:
 * - handleGradeChange(id): Adds/removes a grade ID from the selected filters.
 * - handleSubjectChange(id): Adds/removes a subject ID from the selected filters.
 *
 * Behavior:
 * - Active filters are shown as chips with delete buttons.
 * - Filter panel is collapsible and toggled using an expand/collapse icon button.
 * - Grade and subject filter options are retrieved asynchronously using React Query.
 * - Uses theme colors and gradients for consistent styling.
 *
 * Example Usage:
 * <TestFilters
 *   filters={{ grades: ['g1'], subjects: ['s1'] }}
 *   onFilterChange={handleFilterChange}
 *   onClearFilters={clearAllFilters}
 * />
 */

import {
	Box,
	Paper,
	Typography,
	FormGroup,
	FormControlLabel,
	Checkbox,
	Button,
	Chip,
	Stack,
	Avatar,
	Collapse,
	IconButton,
	Badge,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
	FilterList as FilterIcon,
	Clear as ClearIcon,
	ExpandMore as ExpandMoreIcon,
	ExpandLess as ExpandLessIcon,
	Grade as GradeIcon,
	Subject as SubjectIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getGrades } from "../../api/grades";
import { getSubjects } from "../../api/subjects";
import PropTypes from "prop-types";


export default function TestFilters({
	filters,
	onFilterChange,
	onClearFilters,
}) {
	const theme = useTheme();
	const { t } = useTranslation();
	const [expanded, setExpanded] = useState(false);

	const { data: grades } = useQuery({
		queryKey: ["grades"],
		queryFn: getGrades,
	});

	const { data: subjects } = useQuery({
		queryKey: ["subjects"],
		queryFn: getSubjects,
	});

	const handleGradeChange = (gradeId) => {
		const newGrades = filters.grades.includes(gradeId)
			? filters.grades.filter((id) => id !== gradeId)
			: [...filters.grades, gradeId];
		onFilterChange({ ...filters, grades: newGrades });
	};

	const handleSubjectChange = (subjectId) => {
		const newSubjects = filters.subjects.includes(subjectId)
			? filters.subjects.filter((id) => id !== subjectId)
			: [...filters.subjects, subjectId];
		onFilterChange({ ...filters, subjects: newSubjects });
	};

	const activeFiltersCount = filters.grades.length + filters.subjects.length;
	const hasActiveFilters = activeFiltersCount > 0;

	return (
		<Paper
			elevation={2}
			sx={{
				borderRadius: 3,
				border: `1px solid ${theme.palette.divider}`,
				background: `linear-gradient(145deg, ${theme.palette.background.paper
					} 0%, ${theme.palette.background.elevated || theme.palette.background.paper
					} 100%)`,
				overflow: "hidden",
			}}
		>
			{/* Filter Header */}
			<Box
				sx={{
					p: 2,
					background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
					color: theme.palette.primary.contrastText,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<Avatar
						sx={{
							width: 32,
							height: 32,
							bgcolor: "rgba(255,255,255,0.2)",
							mr: 2,
						}}
					>
						<FilterIcon />
					</Avatar>
					<Typography variant="h6" fontWeight="bold">
						{t("filters.testFilters")}
					</Typography>
					{hasActiveFilters && (
						<Badge
							badgeContent={activeFiltersCount}
							color="secondary"
							sx={{ ml: 1 }}
						>
							<Box />
						</Badge>
					)}
				</Box>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					{hasActiveFilters && (
						<Button
							size="small"
							onClick={onClearFilters}
							startIcon={<ClearIcon />}
							sx={{
								color: "rgba(255,255,255,0.9)",
								borderColor: "rgba(255,255,255,0.3)",
								"&:hover": {
									borderColor: "rgba(255,255,255,0.6)",
									bgcolor: "rgba(255,255,255,0.1)",
								},
							}}
							variant="outlined"
						>
							{t("filters.clearAll")}
						</Button>
					)}
					<IconButton
						onClick={() => setExpanded(!expanded)}
						sx={{
							color: "rgba(255,255,255,0.95)",
							bgcolor: "rgba(255,255,255,0.1)",
							border: "1px solid rgba(255,255,255,0.2)",
							"&:hover": {
								bgcolor: "rgba(255,255,255,0.2)",
								color: "white",
								transform: "scale(1.05)",
							},
							transition: "all 0.2s ease-in-out",
						}}
					>
						{expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
					</IconButton>
				</Box>
			</Box>

			{/* Active Filters Display */}
			{hasActiveFilters && (
				<Box sx={{ p: 2, bgcolor: theme.palette.background.elevated }}>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
						{t("filters.activeFilters")}:
					</Typography>
					<Stack direction="row" spacing={1} flexWrap="wrap">
						{filters.grades.map((gradeId) => {
							const grade = grades?.data?.find((g) => g._id === gradeId);
							return (
								<Chip
									key={gradeId}
									label={grade?.name || t("common.unknown")}
									onDelete={() => handleGradeChange(gradeId)}
									color="primary"
									size="small"
									icon={<GradeIcon />}
									sx={{ fontWeight: "medium" }}
								/>
							);
						})}
						{filters.subjects.map((subjectId) => {
							const subject = subjects?.data?.find((s) => s.id === subjectId);
							return (
								<Chip
									key={subjectId}
									label={subject?.name || t("common.unknown")}
									onDelete={() => handleSubjectChange(subjectId)}
									color="secondary"
									size="small"
									icon={<SubjectIcon />}
									sx={{ fontWeight: "medium" }}
								/>
							);
						})}
					</Stack>
				</Box>
			)}

			{/* Filter Options */}
			<Collapse in={expanded}>
				<Box sx={{ p: 3 }}>
					<Stack spacing={3}>
						{/* Grade Level Filters */}
						<Box>
							<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
								<Avatar
									sx={{
										width: 24,
										height: 24,
										bgcolor: theme.palette.info.main,
										mr: 1,
									}}
								>
									<GradeIcon sx={{ fontSize: 16 }} />
								</Avatar>
								<Typography variant="subtitle1" fontWeight="bold">
									{t("filters.gradeLevel")}
								</Typography>
							</Box>
							<Paper
								sx={{
									p: 2,
									bgcolor: theme.palette.background.elevated,
									borderRadius: 2,
								}}
							>
								<FormGroup row>
									{grades?.data?.map((grade) => (
										<FormControlLabel
											key={grade._id}
											control={
												<Checkbox
													checked={filters.grades.includes(grade.id)}
													onChange={() => handleGradeChange(grade.id)}
													sx={{
														"&.Mui-checked": {
															color: theme.palette.primary.main,
														},
													}}
												/>
											}
											label={grade.name}
											sx={{
												mr: 3,
												"& .MuiFormControlLabel-label": {
													fontWeight: filters.grades.includes(grade.id)
														? "bold"
														: "normal",
												},
											}}
										/>
									))}
								</FormGroup>
							</Paper>
						</Box>

						{/* Subject Filters */}
						<Box>
							<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
								<Avatar
									sx={{
										width: 24,
										height: 24,
										bgcolor: theme.palette.success.main,
										mr: 1,
									}}
								>
									<SubjectIcon sx={{ fontSize: 16 }} />
								</Avatar>
								<Typography variant="subtitle1" fontWeight="bold">
									{t("filters.subject")}
								</Typography>
							</Box>
							<Paper
								sx={{
									p: 2,
									bgcolor: theme.palette.background.elevated,
									borderRadius: 2,
								}}
							>
								<FormGroup row>
									{/* All Subjects */}
									<FormControlLabel
										label="All Subjects"
										control={
											<Checkbox
												checked={filters.subjects.length === subjects?.data?.length}
												indeterminate={
													filters.subjects.length > 0 &&
													filters.subjects.length < subjects?.data?.length
												}
												onChange={(e) => {
													const allIds = subjects.data.map((s) => s.id);
													onFilterChange({
														...filters,
														subjects: e.target.checked ? allIds : [],
													});
												}}
												sx={{
													"&.Mui-checked": {
														color: theme.palette.success.main,
													},
												}}
											/>
										}
									/>
									{subjects?.data?.map((subject) => (
										<FormControlLabel
											key={subject._id}
											control={
												<Checkbox
													checked={filters.subjects.includes(subject.id)}
													onChange={() => handleSubjectChange(subject.id)}
													sx={{
														"&.Mui-checked": {
															color: theme.palette.success.main,
														},
													}}
												/>
											}
											label={subject.name}
											sx={{
												mr: 3,
												"& .MuiFormControlLabel-label": {
													fontWeight: filters.subjects.includes(subject.id)
														? "bold"
														: "normal",
												},
											}}
										/>
									))}
								</FormGroup>
							</Paper>
						</Box>
					</Stack>
				</Box>
			</Collapse>
		</Paper>
	);
}

TestFilters.propTypes = {
	filters: PropTypes.shape({
		grades: PropTypes.arrayOf(PropTypes.string),
		subjects: PropTypes.arrayOf(PropTypes.string),
	}).isRequired,
	onFilterChange: PropTypes.func.isRequired,
	onClearFilters: PropTypes.func.isRequired,
};
