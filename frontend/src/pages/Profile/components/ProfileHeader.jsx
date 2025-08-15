import { useState } from "react";
import {
	Box,
	Paper,
	Typography,
	Avatar,
	Grid,
	Chip,
	Card,
	TextField,
	Button,
	IconButton,
	Autocomplete,
	Alert,
} from "@mui/material";
import {
	School as SchoolIcon,
	Person as PersonIcon,
	Book as BookIcon,
	Edit as EditIcon,
	Save as SaveIcon,
	Cancel as CancelIcon,
	Delete as DeleteIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

// Common specializations list
const SPECIALIZATIONS = [
	"Mathematics",
	"Science",
	"Computer Science",
	"English Literature",
	"Foreign Languages",
	"Social Studies",
	"Arts",
	"Physical Education",
	"Philosophy",
	"Biology",
	"Chemistry",
	"Physics",
	"History",
	"Geography",
	"Economics",
	"Political Science",
	"Art",
	"Music",
];

export default function ProfileHeader({
	user,
	teacherData,
	// Basic info props
	formData,
	setFormData,
	handleSubmit,
	handleChange,
	isUpdatingProfile,
	// Specializations props
	specializations,
	setSpecializations,
	handleSpecializationsSubmit,
	isUpdatingSpecializations,
}) {
	const { t } = useTranslation();
	const [isEditingBasic, setIsEditingBasic] = useState(false);
	const [isEditingSpecializations, setIsEditingSpecializations] =
		useState(false);
	const [passwordError, setPasswordError] = useState("");

	const handleBasicCancel = () => {
		setIsEditingBasic(false);
		setPasswordError("");
		setFormData({
			name: user?.name || "",
			email: user?.email || "",
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		});
	};

	const handleBasicSubmit = (e) => {
		e.preventDefault();
		setPasswordError("");

		// If user wants to change password, current password is required
		if (formData.newPassword && !formData.currentPassword) {
			setPasswordError("Current password is required to change password");
			return;
		}

		// Validate password confirmation
		if (
			formData.newPassword &&
			formData.newPassword !== formData.confirmPassword
		) {
			setPasswordError("New passwords do not match");
			return;
		}

		handleSubmit(e);
		setIsEditingBasic(false);
	};

	const handleSpecializationsCancel = () => {
		setIsEditingSpecializations(false);
		setSpecializations(teacherData?.data?.specializations || []);
	};

	const handleSpecializationsSave = () => {
		if (specializations.length === 0) {
			alert("At least one specialization is required");
			return;
		}
		handleSpecializationsSubmit();
		setIsEditingSpecializations(false);
	};

	const handleAddSpecialization = (newSpecialization) => {
		if (newSpecialization && !specializations.includes(newSpecialization)) {
			setSpecializations([...specializations, newSpecialization]);
		}
	};

	const handleRemoveSpecialization = (specializationToRemove) => {
		if (specializations.length > 1) {
			setSpecializations(
				specializations.filter((spec) => spec !== specializationToRemove)
			);
		}
	};

	const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin";

	return (
		<Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
			<Grid container spacing={4}>
				{/* Avatar and Role Section */}
				<Grid item xs={12} md={3} lg={2}>
					<Box display="flex" flexDirection="column" alignItems="center">
						<Avatar
							sx={{
								width: 180,
								height: 180,
								fontSize: "4rem",
								mb: 2,
								boxShadow: 3,
							}}
						>
							{user?.name?.charAt(0).toUpperCase()}
						</Avatar>
						<Chip
							icon={<SchoolIcon />}
							label={user?.role?.toUpperCase()}
							color={
								user?.role === "admin"
									? "error"
									: user?.role === "teacher"
									? "primary"
									: "success"
							}
							size="large"
							sx={{ fontWeight: "bold" }}
						/>
					</Box>
				</Grid>

				{/* Main Content Section */}
				<Grid item xs={12} md={9} lg={10}>
					<Typography
						variant="h3"
						gutterBottom
						fontWeight="bold"
						sx={{ mb: 3 }}
					>
						{user?.name}
					</Typography>

					<Grid container spacing={3}>
						{/* Basic Information Card */}
						<Grid item xs={12} lg={isTeacherOrAdmin ? 6 : 12}>
							<Card sx={{ p: 3, height: "100%" }}>
								<Box display="flex" alignItems="center" mb={3}>
									<PersonIcon color="primary" sx={{ mr: 2, fontSize: 28 }} />
									<Typography variant="h5" fontWeight="bold">
										Basic Information
									</Typography>
									<IconButton
										onClick={() => setIsEditingBasic(!isEditingBasic)}
										sx={{ ml: "auto" }}
									>
										<EditIcon />
									</IconButton>
								</Box>

								{passwordError && (
									<Alert severity="error" sx={{ mb: 2 }}>
										{passwordError}
									</Alert>
								)}

								{isEditingBasic ? (
									<form onSubmit={handleBasicSubmit}>
										<Grid container spacing={2}>
											<Grid item xs={12}>
												<TextField
													name="name"
													label={t("common.name")}
													value={formData.name}
													onChange={handleChange}
													fullWidth
													variant="outlined"
												/>
											</Grid>
											<Grid item xs={12}>
												<TextField
													name="email"
													label={t("common.email")}
													value={formData.email}
													onChange={handleChange}
													fullWidth
													variant="outlined"
												/>
											</Grid>
											<Grid item xs={12}>
												<TextField
													name="currentPassword"
													label="Current Password"
													type="password"
													value={formData.currentPassword}
													onChange={handleChange}
													fullWidth
													variant="outlined"
													helperText="Required only if changing password"
												/>
											</Grid>
											<Grid item xs={12}>
												<TextField
													name="newPassword"
													label="New Password"
													type="password"
													value={formData.newPassword}
													onChange={handleChange}
													fullWidth
													variant="outlined"
													helperText="Leave blank to keep current password"
												/>
											</Grid>
											<Grid item xs={12}>
												<TextField
													name="confirmPassword"
													label="Confirm New Password"
													type="password"
													value={formData.confirmPassword}
													onChange={handleChange}
													fullWidth
													variant="outlined"
													disabled={!formData.newPassword}
												/>
											</Grid>
											<Grid item xs={12}>
												<Box sx={{ display: "flex", gap: 2 }}>
													<Button
														type="submit"
														variant="contained"
														startIcon={<SaveIcon />}
														disabled={isUpdatingProfile}
													>
														{t("common.save")}
													</Button>
													<Button
														variant="outlined"
														startIcon={<CancelIcon />}
														onClick={handleBasicCancel}
													>
														{t("common.cancel")}
													</Button>
												</Box>
											</Grid>
										</Grid>
									</form>
								) : (
									<Box sx={{ "& > *": { mb: 2 } }}>
										<Typography variant="h6">
											<strong>Name:</strong> {user?.name}
										</Typography>
										<Typography variant="h6">
											<strong>Email:</strong> {user?.email}
										</Typography>
										<Typography variant="h6">
											<strong>Role:</strong> {user?.role}
										</Typography>
									</Box>
								)}
							</Card>
						</Grid>

						{/* Specializations Card - Only for Teachers/Admins */}
						{isTeacherOrAdmin && (
							<Grid item xs={12} lg={6}>
								<Card sx={{ p: 3, height: "100%" }}>
									<Box display="flex" alignItems="center" mb={3}>
										<BookIcon color="primary" sx={{ mr: 2, fontSize: 28 }} />
										<Typography variant="h5" fontWeight="bold">
											Specializations
										</Typography>
										<IconButton
											onClick={() =>
												setIsEditingSpecializations(!isEditingSpecializations)
											}
											sx={{ ml: "auto" }}
										>
											<EditIcon />
										</IconButton>
									</Box>

									{isEditingSpecializations ? (
										<Box>
											<Autocomplete
												freeSolo
												options={SPECIALIZATIONS}
												onInputChange={(event, newInputValue) => {
													if (
														event?.type === "keydown" &&
														event.key === "Enter"
													) {
														handleAddSpecialization(newInputValue);
													}
												}}
												onChange={(event, newValue) => {
													if (newValue) {
														handleAddSpecialization(newValue);
													}
												}}
												renderInput={(params) => (
													<TextField
														{...params}
														label="Add Specialization"
														helperText="Type or select a specialization and press Enter"
														sx={{ mb: 2 }}
													/>
												)}
											/>

											<Box sx={{ mb: 3 }}>
												<Typography variant="subtitle2" sx={{ mb: 1 }}>
													Current Specializations:
												</Typography>
												<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
													{specializations.map((spec, index) => (
														<Chip
															key={index}
															label={spec}
															onDelete={
																specializations.length > 1
																	? () => handleRemoveSpecialization(spec)
																	: undefined
															}
															deleteIcon={<DeleteIcon />}
															color="primary"
															variant="outlined"
														/>
													))}
												</Box>
											</Box>

											<Box sx={{ display: "flex", gap: 2 }}>
												<Button
													variant="contained"
													startIcon={<SaveIcon />}
													onClick={handleSpecializationsSave}
													disabled={isUpdatingSpecializations}
												>
													{t("common.save")}
												</Button>
												<Button
													variant="outlined"
													startIcon={<CancelIcon />}
													onClick={handleSpecializationsCancel}
												>
													{t("common.cancel")}
												</Button>
											</Box>
										</Box>
									) : (
										<Box>
											{specializations.length > 0 ? (
												<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
													{specializations.map((spec, index) => (
														<Chip
															key={index}
															label={spec}
															color="primary"
															size="large"
															sx={{ fontSize: "1rem", fontWeight: "medium" }}
														/>
													))}
												</Box>
											) : (
												<Typography variant="h6" color="text.secondary">
													No specializations set
												</Typography>
											)}
										</Box>
									)}
								</Card>
							</Grid>
						)}
					</Grid>
				</Grid>
			</Grid>
		</Paper>
	);
}

ProfileHeader.propTypes = {
	user: PropTypes.shape({
		name: PropTypes.string,
		email: PropTypes.string,
		role: PropTypes.string,
	}),
	teacherData: PropTypes.shape({
		data: PropTypes.shape({
			specializations: PropTypes.arrayOf(PropTypes.string),
		}),
	}),
	// Basic info props
	formData: PropTypes.shape({
		name: PropTypes.string,
		email: PropTypes.string,
		currentPassword: PropTypes.string,
		newPassword: PropTypes.string,
		confirmPassword: PropTypes.string,
	}).isRequired,
	setFormData: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
	handleChange: PropTypes.func.isRequired,
	isUpdatingProfile: PropTypes.bool,
	// Specializations props
	specializations: PropTypes.arrayOf(PropTypes.string).isRequired,
	setSpecializations: PropTypes.func.isRequired,
	handleSpecializationsSubmit: PropTypes.func.isRequired,
	isUpdatingSpecializations: PropTypes.bool,
};
