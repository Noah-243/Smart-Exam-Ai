import { Box, Typography, Button, Paper, Chip, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
	Add as AddIcon,
	Book as BookIcon,
	Class as ClassIcon,
} from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import PropTypes from "prop-types";

export default function TeachingAssignmentsTable({
	teachingAssignments,
	user,
	onDelete,
	onAdd,
	onEdit,
	getSubjectNameById,
	getGradeNameById,
	isLoading,
}) {
	const theme = useTheme();

	const handleEditClick = (params) => {
		const assignment = teachingAssignments[params.id];
		onEdit(params.id, assignment);
	};

	const handleDeleteClick = (params) => {
		if (window.confirm("Are you sure you want to delete this assignment?")) {
			onDelete(params.id);
		}
	};

	const columns = [
		{
			field: "subject",
			headerName: "Subject",
			flex: 1,
			minWidth: 200,
			renderHeader: () => (
				<Box display="flex" alignItems="center">
					<BookIcon sx={{ mr: 1 }} />
					Subject
				</Box>
			),
			renderCell: (params) => (
				<Typography variant="body1" fontWeight="medium">
					{getSubjectNameById(params.row.subject)}
				</Typography>
			),
		},
		{
			field: "grades",
			headerName: "Classes",
			flex: 1.5,
			minWidth: 300,
			renderHeader: () => (
				<Box display="flex" alignItems="center">
					<ClassIcon sx={{ mr: 1 }} />
					Classes
				</Box>
			),
			renderCell: (params) => (
				<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
					{params.row.grades.map((gradeId, index) => (
						<Chip
							key={index}
							label={getGradeNameById(gradeId)}
							size="small"
							color="primary"
							variant="outlined"
						/>
					))}
				</Box>
			),
		},
		{
			field: "actions",
			headerName: "Actions",
			width: 200,
			sortable: false,
			filterable: false,
			renderCell: (params) => (
				<Stack direction="row" spacing={1}>
					<Button
						size="small"
						variant="outlined"
						onClick={() => handleEditClick(params)}
						disabled={isLoading}
					>
						Edit
					</Button>
					<Button
						size="small"
						variant="outlined"
						color="error"
						onClick={() => handleDeleteClick(params)}
						disabled={isLoading}
					>
						Delete
					</Button>
				</Stack>
			),
		},
	];

	const rows = teachingAssignments.map((assignment, index) => ({
		id: index,
		subject: assignment.subject,
		grades: assignment.grades,
	}));

	if (teachingAssignments.length === 0) {
		return (
			<Paper sx={{ p: 4, borderRadius: 3 }}>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					mb={3}
				>
					<Typography variant="h4" fontWeight="bold">
						Teaching Assignments
					</Typography>
					{(user?.role === "teacher" || user?.role === "admin") && (
						<Button
							startIcon={<AddIcon />}
							variant="contained"
							onClick={onAdd}
							size="large"
						>
							Add Assignment
						</Button>
					)}
				</Box>
				<Box
					sx={{
						textAlign: "center",
						py: 8,
						backgroundColor: theme.palette.background.elevated,
						borderRadius: 2,
					}}
				>
					<BookIcon
						sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }}
					/>
					<Typography variant="h6" color="textSecondary">
						No teaching assignments found
					</Typography>
				</Box>
			</Paper>
		);
	}

	return (
		<Paper sx={{ p: 4, borderRadius: 3 }}>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				mb={3}
			>
				<Typography variant="h4" fontWeight="bold">
					Teaching Assignments
				</Typography>
				{(user?.role === "teacher" || user?.role === "admin") && (
					<Button
						startIcon={<AddIcon />}
						variant="contained"
						onClick={onAdd}
						size="large"
					>
						Add Assignment
					</Button>
				)}
			</Box>

			<Box sx={{ height: 400, width: "100%" }}>
				<DataGrid
					rows={rows}
					columns={columns}
					pageSize={10}
					rowsPerPageOptions={[5, 10, 25]}
					checkboxSelection={false}
					disableSelectionOnClick
					components={{
						Toolbar: GridToolbar,
					}}
					componentsProps={{
						toolbar: {
							showQuickFilter: true,
							quickFilterProps: { debounceMs: 500 },
						},
					}}
					sx={{
						"& .MuiDataGrid-cell": {
							padding: "8px 16px",
						},
						"& .MuiDataGrid-columnHeaderTitle": {
							fontWeight: "bold",
						},
						"& .MuiDataGrid-row:hover": {
							backgroundColor: theme.palette.action.hover,
						},
					}}
				/>
			</Box>
		</Paper>
	);
}

TeachingAssignmentsTable.propTypes = {
	teachingAssignments: PropTypes.arrayOf(
		PropTypes.shape({
			subject: PropTypes.oneOfType([
				PropTypes.string,
				PropTypes.shape({
					_id: PropTypes.string,
					name: PropTypes.string,
				}),
			]).isRequired,
			grades: PropTypes.arrayOf(
				PropTypes.oneOfType([
					PropTypes.string,
					PropTypes.shape({
						_id: PropTypes.string,
						name: PropTypes.string,
					}),
				])
			).isRequired,
		})
	).isRequired,
	user: PropTypes.shape({
		role: PropTypes.string,
	}),
	onDelete: PropTypes.func.isRequired,
	onAdd: PropTypes.func.isRequired,
	onEdit: PropTypes.func.isRequired,
	getSubjectNameById: PropTypes.func.isRequired,
	getGradeNameById: PropTypes.func.isRequired,
	isLoading: PropTypes.bool,
};
