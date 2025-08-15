import PropTypes from "prop-types";
import {
	Card,
	CardContent,
	Avatar,
	Typography,
	Box,
	Grid,
} from "@mui/material";
import {
	Person as PersonIcon,
	School as SchoolIcon,
	AssignmentTurnedIn as AssignmentTurnedInIcon,
	Grade as GradeIcon,
	Event as EventIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const StudentProfile = ({ user, dashboardData }) => {
	const theme = useTheme();

	return (
		<Card
			sx={{
				mb: 3,
				bgcolor: theme.palette.background.paper,
				borderRadius: 3,
				boxShadow: theme.shadows[3],
				border: `1px solid ${theme.palette.divider}`,
			}}
		>
			<CardContent sx={{ p: 3 }}>
				<Grid container spacing={3} alignItems="center">
					<Grid item xs={12} md={6}>
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<Avatar
								sx={{
									width: 80,
									height: 80,
									bgcolor: theme.palette.primary.main,
									color: theme.palette.primary.contrastText,
									mr: 3,
									fontSize: "2rem",
								}}
							>
								<PersonIcon sx={{ fontSize: 50 }} />
							</Avatar>
							<Box>
								<Typography
									variant="h4"
									fontWeight="bold"
									gutterBottom
									color="text.primary"
								>
									{user?.name}
								</Typography>
								<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
									<SchoolIcon
										sx={{
											mr: 1,
											fontSize: 20,
											color: theme.palette.primary.main,
										}}
									/>
									<Typography variant="h6" color="text.secondary">
										{dashboardData?.student?.profile?.grade?.name || "N/A"}
									</Typography>
								</Box>
								<Typography
									variant="body1"
									color="text.secondary"
									sx={{ fontSize: "1rem" }}
								>
									{user?.email}
								</Typography>
							</Box>
						</Box>
					</Grid>
					<Grid item xs={12} md={6}>
						<Box
							sx={{
								display: "flex",
								flexWrap: "wrap",
								gap: 3,
								justifyContent: { xs: "center", md: "flex-end" },
							}}
						>
							<Box
								sx={{
									textAlign: "center",
									p: 2,
									width: "130px",
									bgcolor: theme.palette.background.elevated,
									color: theme.palette.text.primary,
									borderRadius: 2,
									boxShadow: 1,
									border: `1px solid ${theme.palette.divider}`,
								}}
							>
								<AssignmentTurnedInIcon
									color="primary"
									sx={{ fontSize: 40, mb: 1 }}
								/>
								<Typography variant="h4" color="primary" fontWeight="bold">
									{dashboardData?.stats?.totalTestsTaken || 0}
								</Typography>
								<Typography variant="subtitle1" color="text.secondary">
									Tests Taken
								</Typography>
							</Box>
							<Box
								sx={{
									textAlign: "center",
									p: 2,
									width: "130px",
									bgcolor: theme.palette.background.elevated,
									color: theme.palette.text.primary,
									borderRadius: 2,
									boxShadow: 1,
									border: `1px solid ${theme.palette.divider}`,
								}}
							>
								<GradeIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
								<Typography variant="h4" color="primary" fontWeight="bold">
									{dashboardData?.stats?.averageScore?.toFixed(1) || "0.0"}%
								</Typography>
								<Typography variant="subtitle1" color="text.secondary">
									Avg. Score
								</Typography>
							</Box>
							<Box
								sx={{
									textAlign: "center",
									p: 2,
									width: "130px",
									bgcolor: theme.palette.background.elevated,
									color: theme.palette.text.primary,
									borderRadius: 2,
									boxShadow: 1,
									border: `1px solid ${theme.palette.divider}`,
								}}
							>
								<EventIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
								<Typography variant="h4" color="primary" fontWeight="bold">
									{dashboardData?.stats?.upcomingTests || 0}
								</Typography>
								<Typography variant="subtitle1" color="text.secondary">
									Upcoming
								</Typography>
							</Box>
						</Box>
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
};

StudentProfile.propTypes = {
	user: PropTypes.object,
	dashboardData: PropTypes.object,
};

export default StudentProfile;
