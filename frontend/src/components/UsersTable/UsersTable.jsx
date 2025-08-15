/**
 * UsersTable Component
 * --------------------
 * This React component displays a table of users using MUI's DataGrid,
 * allowing administrators to manage users within the system.
 * 
 * Features:
 * - Display a list of users with columns for name, email, role, and actions
 * - Filtering options by role (all/student/teacher/admin) and keyword search (name/email)
 * - Add new user functionality via modal form
 * - Edit existing user data in a modal form
 * - Delete users with confirmation prompt
 * 
 * Data Management:
 * - Uses React Query (`useMutation` and `useQueryClient`) to manage user deletion
 * - Invalidates the dashboard query upon user deletion to keep data up to date
 * 
 * Props:
 * - `users` (Array): List of user objects to display in the table.
 * 
 * Components Used:
 * - `DataGrid` (from @mui/x-data-grid) with built-in toolbar
 * - `AddUserForm`: Modal form to add a new user
 * - `EditUserForm`: Modal form to edit selected user
 * - `@mui/material` components (Box, Stack, IconButton, Tooltip, etc.)
 * - Material Icons: Add, Edit, Delete
 * 
 * Internationalization:
 * - Uses `react-i18next` to support multilingual labels and messages
 * 
 * State Management:
 * - `isAddUserOpen`: Boolean to toggle the add user modal
 * - `isEditUserOpen`: Boolean to toggle the edit user modal
 * - `selectedUser`: Stores the user object selected for editing
 * - `filters`: Holds filtering criteria (role and search query)
 * 
 * Notes:
 * - Prevents deleting the currently logged-in user (by comparing with cached query data)
 * - Confirms deletion via browser confirm dialog
 * 
 * Example usage:
 * <UsersTable users={allUsers} />
 */

import { useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
	Box,
	Button,
	IconButton,
	Tooltip,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Stack,
} from "@mui/material";
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	Add as AddIcon,
} from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUser } from "../../api/users";
import AddUserForm from "../AddUserForm/AddUserForm";
import EditUserForm from "../EditUserForm/EditUserForm";
import { useTranslation } from "react-i18next";

export default function UsersTable({ users = [] }) {
	const { t } = useTranslation();
	const [isAddUserOpen, setIsAddUserOpen] = useState(false);
	const [isEditUserOpen, setIsEditUserOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const queryClient = useQueryClient();
	const [filters, setFilters] = useState({
		role: "all",
		search: "",
	});

	const { mutate: removeUser } = useMutation({
		mutationFn: deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries(["dashboard"]);
		},
	});

	const filteredUsers = users.filter((u) => {
  const q = (filters.search || "").toLowerCase();
  return (
    (filters.role === "all" || u?.role === filters.role) &&
    ((u?.name || "").toLowerCase().includes(q) ||
     (u?.email || "").toLowerCase().includes(q))
  );
});

	const handleFilterChange = (event) => {
		const { name, value } = event.target;
		setFilters((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleDeleteUser = async (userId) => {
		if (window.confirm(t("admin.confirmDeleteUser"))) {
			try {
				await removeUser(userId);
			} catch (error) {
				console.error("Error deleting user:", error);
			}
		}
	};

	const columns = [
		{ field: "name", headerName: t("common.name"), flex: 1 },
		{ field: "email", headerName: t("common.email"), flex: 1 },
		{ field: "role", headerName: t("common.role"), flex: 1 },
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
								setSelectedUser(params.row);
								setIsEditUserOpen(true);
							}}
						>
							<EditIcon />
						</IconButton>
					</Tooltip>
					<Tooltip title={t("common.delete")}>
						<IconButton
							onClick={() => handleDeleteUser(params.row._id)}
							disabled={
								params.row._id === queryClient.getQueryData(["user"])?.id
							}
						>
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
						<InputLabel>{t("common.role")}</InputLabel>
						<Select
							name="role"
							value={filters.role}
							onChange={handleFilterChange}
							label={t("common.role")}
							size="small"
						>
							<MenuItem value="all">{t("users.allRoles")}</MenuItem>
							<MenuItem value="student">{t("users.student")}</MenuItem>
							<MenuItem value="teacher">{t("users.teacher")}</MenuItem>
							<MenuItem value="admin">{t("users.admin")}</MenuItem>
						</Select>
					</FormControl>
					<TextField
						name="search"
						value={filters.search}
						onChange={handleFilterChange}
						placeholder={t("users.searchUsers")}
						size="small"
					/>
				</Stack>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => setIsAddUserOpen(true)}
				>
					{t("users.addUser")}
				</Button>
			</Stack>
			<DataGrid
				rows={filteredUsers}
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
			<AddUserForm
				open={isAddUserOpen}
				onClose={() => setIsAddUserOpen(false)}
			/>
			<EditUserForm
				open={isEditUserOpen}
				onClose={() => {
					setIsEditUserOpen(false);
					setSelectedUser(null);
				}}
				user={selectedUser}
			/>
		</Box>
	);
}
