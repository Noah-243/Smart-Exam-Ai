/**
 * EditUserForm.jsx
 *
 * React component that renders a dialog form for editing an existing user.
 * It allows updating the user's full name, email, and role (student, teacher, admin).
 *
 * Technologies used:
 * - React hooks (useState, useEffect)
 * - React Query for mutation and cache updates
 * - Material UI for dialog and form components
 *
 * Props:
 * - open (boolean): whether the dialog is open
 * - onClose (function): callback to close the dialog
 * - user (object|null): the user object to be edited
 */

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "../../api/users";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Alert,
	Box,
} from "@mui/material";

/**
 * EditUserForm component definition
 */
export default function EditUserForm({ open, onClose, user = null }) {
	// Access React Query client to manage cached queries
	const queryClient = useQueryClient();

	// Form state for user fields
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		role: "",
	});

	// Error state for displaying form submission errors
	const [error, setError] = useState("");

	/**
	 * Populate form data when the `user` prop is available/changes
	 */
	useEffect(() => {
		if (user) {
			setFormData({
				name: user.name,
				email: user.email,
				role: user.role,
			});
		}
	}, [user]);

	/**
	 * Mutation for updating the user via API
	 * On success, it invalidates the dashboard query and closes the dialog
	 * On error, it displays the error message
	 */
	const { mutate: submitUser, isLoading } = useMutation({
		mutationFn: (data) => updateUser(user._id, data),
		onSuccess: () => {
			queryClient.invalidateQueries(["dashboard"]);
			onClose();
		},
		onError: (error) => {
			setError(error.response?.data?.error || "Error updating user");
		},
	});

	/**
	 * Handle form submission:
	 * - Validate all required fields
	 * - Submit form data via mutation
	 */
	const handleSubmit = (e) => {
		e.preventDefault();
		setError("");

		if (!formData.name || !formData.email || !formData.role) {
			setError("Please fill in all required fields");
			return;
		}

		submitUser(formData);
	};

	/**
	 * Handle changes to individual form fields
	 */
	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	// Don't render the form if no user is provided
	if (!user) return null;

	// Render dialog with the user form
	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Edit User</DialogTitle>
			<form onSubmit={handleSubmit}>
				<DialogContent>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
						{error && <Alert severity="error">{error}</Alert>}
						<TextField
							name="name"
							label="Full Name"
							value={formData.name}
							onChange={handleChange}
							required
							fullWidth
						/>
						<TextField
							name="email"
							label="Email"
							type="email"
							value={formData.email}
							onChange={handleChange}
							required
							fullWidth
						/>
						<FormControl fullWidth>
							<InputLabel>Role</InputLabel>
							<Select
								name="role"
								value={formData.role}
								onChange={handleChange}
								label="Role"
								disabled={user._id === queryClient.getQueryData(["user"])?.id} // Prevent self-role change
							>
								<MenuItem value="student">Student</MenuItem>
								<MenuItem value="teacher">Teacher</MenuItem>
								<MenuItem value="admin">Admin</MenuItem>
							</Select>
						</FormControl>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>Cancel</Button>
					<Button
						type="submit"
						variant="contained"
						color="primary"
						disabled={isLoading}
					>
						Save Changes
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}
