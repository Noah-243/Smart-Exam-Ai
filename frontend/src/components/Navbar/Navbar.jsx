/**
 * Navbar Component
 *
 * Description:
 * This component renders the main navigation bar (AppBar) for the Exemind-AI platform.
 * It adapts to both desktop and mobile views, provides route-based navigation, profile access,
 * logout functionality, test access for students, language/theme toggles, and dynamic route visibility
 * based on user role permissions.
 *
 * Features:
 * - Displays a responsive AppBar with logo navigation, route buttons, and menus
 * - Navigation options are filtered by the user's permission (via useRoutePermissions)
 * - Automatically shows a “Start Exam” button if a test is available for a student user (with polling every 60s)
 * - Displays dynamic buttons/icons for Profile, Logout, Language Selector, and Theme Toggle
 * - Uses MUI styling for consistent appearance in dark/light modes
 *
 * Hooks and Utilities:
 * - `useUser` for authentication, logout, and current user data
 * - `useRoutePermissions` to check which routes a user is allowed to access
 * - `useQuery` from React Query to fetch the currently available test for students
 * - `useNavigate` and `useLocation` from React Router for programmatic navigation
 * - `useTranslation` from react-i18next for multi-language label support
 * - `useTheme` from MUI for dynamic theme-based styling
 *
 * Components Used:
 * - Material UI: AppBar, Toolbar, IconButton, Button, Avatar, Menu, MenuItem, Tooltip, etc.
 * - Custom: `ThemeToggle`, `LanguageSelector`
 *
 * Behavior:
 * - Logo click navigates to home
 * - On mobile view, a hamburger menu opens a dropdown with nav links
 * - On desktop view, route buttons are shown inline
 * - Active route is visually highlighted
 * - User avatar opens a profile/logout menu
 * - Not authenticated users see a "Login" button
 * - Student users see a special button if there's a test available (`/take-test/:id`)
 *
 * Notes:
 * - The navigation items are built dynamically based on user role and permissions
 * - Available test for students is fetched continuously every 60 seconds for real-time availability
 * - Mobile menu and user menu are handled via controlled anchors
 */

import { useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { ROUTES } from "../../routes/routeConfig.jsx";
import {
	Button,
	AppBar,
	Box,
	IconButton,
	Toolbar,
	Menu,
	MenuItem,
	Avatar,
	Tooltip,
	useTheme,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import LanguageSelector from "../LanguageSelector";
import {
	Menu as MenuIcon,
	Logout as LogoutIcon,
	AssignmentTurnedIn as TestIcon,
	Dashboard as DashboardIcon,
	QuestionMark as QuestionIcon,
	Assignment as AssignmentIcon,
	Schedule as ScheduleIcon,
	School as GradesIcon,
	AssignmentTurnedIn as GradeTestsIcon,
	History as PastTestsIcon,
} from "@mui/icons-material";
import { useRoutePermissions } from "../../hooks/useRoutePermissions";
import { useQuery } from "@tanstack/react-query";
import { getAvailableTest } from "../../api/studentDashboard";
import { useTranslation } from "react-i18next";
import logo from "../../assets/logo.png";

export default function Navbar() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, logout, isAuthenticated } = useUser();
	const { canAccessRoute } = useRoutePermissions();
	const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
	const [userMenuAnchor, setUserMenuAnchor] = useState(null);
	const { t } = useTranslation();
	const theme = useTheme();

	// Query for available test if user is a student
	const { data: availableTest } = useQuery({
		queryKey: ["availableTest"],
		queryFn: getAvailableTest,
		enabled: !!user && user.role === "student",
		refetchInterval: 60000, // Refetch every minute
	});

	const handleMobileMenuOpen = (event) => {
		setMobileMenuAnchor(event.currentTarget);
	};

	const handleMobileMenuClose = () => {
		setMobileMenuAnchor(null);
	};

	const handleUserMenuClose = () => {
		setUserMenuAnchor(null);
	};

	const handleLogout = async () => {
		handleUserMenuClose();
		await logout();
	};

	const handleProfile = () => {
		handleUserMenuClose();
		navigate(ROUTES.PROFILE);
	};

	const handleTakeTest = () => {
		navigate(`/take-test/${availableTest?.data?._id}`);
	};

	const navItems = [
		// Removed redundant Home link since logo already navigates to home
		{
			label: t("common.dashboard"),
			path: ROUTES.ADMIN_DASHBOARD,
			icon: <DashboardIcon />,
		},
		{
			label: t("navbar.questions"),
			path: ROUTES.QUESTIONS,
			icon: <QuestionIcon />,
		},
		{
			label: t("navbar.tests"),
			path: ROUTES.TESTS,
			icon: <AssignmentIcon />,
		},
		{
			label: t("navbar.scheduleTests"),
			path: ROUTES.SCHEDULE_TESTS,
			icon: <ScheduleIcon />,
		},
		{
			label: t("navbar.grades"),
			path: ROUTES.GRADES,
			icon: <GradesIcon />,
		},
		{
			label: t("navbar.gradeTests"),
			path: ROUTES.TEACHER_TESTS,
			icon: <GradeTestsIcon />,
		},
		// { label: t("navbar.gradedTests"), path: ROUTES.GRADED_TESTS },
		// { label: t("navbar.availableTests"), path: ROUTES.AVAILABLE_TESTS },
		{
			label: t("navbar.pastTests"),
			path: ROUTES.PAST_TESTS,
			icon: <PastTestsIcon />,
		},
	].filter((item) => canAccessRoute(item.path));

	return (
		<AppBar
			position="sticky"
			elevation={4}
			sx={{
				background:
					theme.palette.mode === "dark"
						? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${
								theme.palette.background.elevated ||
								theme.palette.background.paper
						  } 100%)`
						: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
				backdropFilter: "blur(8px)",
				WebkitBackdropFilter: "blur(8px)",
				borderBottom: `1px solid ${theme.palette.divider}`,
				boxShadow: theme.shadows[4],
			}}
		>
			<Toolbar
				sx={{
					display: "flex",
					justifyContent: "space-between",
					padding: { xs: "0.5rem 1rem", md: "0.5rem 2rem" },
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center" }}>
					{/* Logo - navigates to home when clicked */}
					<Box
						component="img"
						src={logo}
						alt="Exemind-AI Logo"
						sx={{
							height: 50,
							mr: 3,
							cursor: "pointer",
							transition: "transform 0.3s ease",
							"&:hover": {
								transform: "scale(1.05)",
							},
							borderRadius: "50%",
							padding: "3px",
							backgroundColor: "rgba(255, 255, 255, 0.1)",
							border: "2px solid rgba(255, 255, 255, 0.2)",
							boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
						}}
						onClick={() => navigate(ROUTES.HOME)}
					/>
					{isAuthenticated && navItems.length > 0 && (
						<>
							<IconButton
								size="large"
								edge="start"
								color="inherit"
								aria-label="menu"
								sx={{
									mr: 2,
									display: { sm: "none" },
									backgroundColor: "rgba(255, 255, 255, 0.1)",
									"&:hover": {
										backgroundColor: "rgba(255, 255, 255, 0.2)",
									},
								}}
								onClick={handleMobileMenuOpen}
							>
								<MenuIcon />
							</IconButton>

							<Menu
								anchorEl={mobileMenuAnchor}
								open={Boolean(mobileMenuAnchor)}
								onClose={handleMobileMenuClose}
								sx={{ display: { sm: "none" } }}
								PaperProps={{
									elevation: 3,
									sx: {
										minWidth: 200,
										borderRadius: "8px",
										mt: 1,
										padding: "8px 0",
										"& .MuiList-root": {
											padding: "8px 0",
										},
									},
								}}
							>
								{navItems.map((item) => (
									<MenuItem
										key={item.path}
										onClick={() => {
											handleMobileMenuClose();
											navigate(item.path);
										}}
										sx={{
											padding: "10px 16px",
											display: "flex",
											gap: "16px",
											alignItems: "center",
											borderLeft:
												location.pathname === item.path
													? `3px solid ${theme.palette.primary.main}`
													: "3px solid transparent",
											backgroundColor:
												location.pathname === item.path
													? theme.palette.action.selected
													: "transparent",
											transition: "all 0.2s ease",
											"&:hover": {
												borderLeft: `3px solid ${theme.palette.primary.main}`,
												backgroundColor: theme.palette.action.hover,
												"& .MuiSvgIcon-root": {
													color: theme.palette.primary.main,
													transform: "scale(1.1)",
												},
											},
										}}
									>
										<Box
											sx={{
												color:
													location.pathname === item.path
														? theme.palette.primary.main
														: theme.palette.text.secondary,
												display: "flex",
												"& .MuiSvgIcon-root": {
													transition: "all 0.2s ease",
													fontSize: "1.2rem",
												},
											}}
										>
											{item.icon}
										</Box>
										<Box
											sx={{
												fontWeight: location.pathname === item.path ? 600 : 500,
												color:
													location.pathname === item.path
														? theme.palette.primary.main
														: "inherit",
											}}
										>
											{item.label}
										</Box>
									</MenuItem>
								))}
							</Menu>

							<Box
								sx={{
									display: { xs: "none", sm: "flex" },
									gap: 1,
									alignItems: "center",
								}}
							>
								{navItems.map((item) => (
									<Tooltip
										key={item.path}
										title={item.label}
										arrow
										placement="bottom"
									>
										<Button
											onClick={() => navigate(item.path)}
											sx={{
												color:
													location.pathname === item.path
														? theme.palette.primary.contrastText
														: theme.palette.mode === "dark"
														? theme.palette.text.secondary
														: "rgba(255, 255, 255, 0.9)",
												textTransform: "none",
												fontSize: "0.9rem",
												fontWeight: location.pathname === item.path ? 600 : 500,
												borderRadius: "8px",
												padding: "6px 12px",
												minWidth: "auto",
												display: "flex",
												alignItems: "center",
												gap: "6px",
												position: "relative",
												"&::after": {
													content: '""',
													position: "absolute",
													bottom: 0,
													left: location.pathname === item.path ? "10%" : "50%",
													width: location.pathname === item.path ? "80%" : 0,
													height: "3px",
													backgroundColor: theme.palette.primary.contrastText,
													transition: "all 0.3s ease",
													borderRadius: "3px",
												},
												"&:hover": {
													backgroundColor: theme.palette.action.hover,
													color: theme.palette.primary.contrastText,
													"&::after": {
														width: "80%",
														left: "10%",
													},
													"& .MuiSvgIcon-root": {
														transform: "scale(1.1)",
													},
												},
												"& .MuiSvgIcon-root": {
													fontSize: "1.2rem",
													transition: "transform 0.3s ease",
													color:
														location.pathname === item.path
															? theme.palette.primary.contrastText
															: "inherit",
												},
											}}
										>
											{item.icon}
											{item.label}
										</Button>
									</Tooltip>
								))}
							</Box>
						</>
					)}
				</Box>

				<Box
					sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 } }}
				>
					{/* Take Test Button - Only show for students when a test is available */}
					{user?.role === "student" && availableTest?.data && (
						<Button
							variant="contained"
							color="secondary"
							startIcon={<TestIcon />}
							onClick={handleTakeTest}
							sx={{
								animation: "pulse 2s infinite",
								borderRadius: "20px",
								padding: "8px 16px",
								fontWeight: "bold",
								boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
								"@keyframes pulse": {
									"0%": {
										boxShadow: "0 0 0 0 rgba(255, 255, 255, 0.4)",
									},
									"70%": {
										boxShadow: "0 0 0 10px rgba(255, 255, 255, 0)",
									},
									"100%": {
										boxShadow: "0 0 0 0 rgba(255, 255, 255, 0)",
									},
								},
								"&:hover": {
									transform: "translateY(-2px)",
									boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
								},
								transition: "all 0.3s ease",
							}}
						>
							{t("exams.startExam")}
						</Button>
					)}
					<ThemeToggle />
					<LanguageSelector />
					{isAuthenticated ? (
						<>
							<Tooltip title={t("common.profile")} arrow placement="bottom">
								<IconButton
									size="large"
									aria-label="account of current user"
									onClick={handleProfile}
									sx={{
										color: theme.palette.primary.contrastText,
										backgroundColor: theme.palette.action.hover,
										padding: "8px",
										transition: "all 0.3s ease",
										"&:hover": {
											backgroundColor: theme.palette.action.selected,
											transform: "scale(1.05)",
										},
									}}
								>
									<Avatar
										sx={{
											width: 32,
											height: 32,
											backgroundColor: theme.palette.primary.light,
											border: `2px solid ${theme.palette.primary.contrastText}`,
										}}
									>
										{user?.name?.charAt(0).toUpperCase()}
									</Avatar>
								</IconButton>
							</Tooltip>
							<Tooltip title={t("common.logout")} arrow placement="bottom">
								<IconButton
									onClick={handleLogout}
									sx={{
										color: theme.palette.primary.contrastText,
										backgroundColor: theme.palette.action.hover,
										ml: 1,
										borderRadius: "8px",
										padding: "8px",
										transition: "all 0.3s ease",
										"&:hover": {
											backgroundColor: theme.palette.action.selected,
											transform: "scale(1.05)",
										},
									}}
								>
									<LogoutIcon />
								</IconButton>
							</Tooltip>

							<Menu
								id="menu-appbar"
								anchorEl={userMenuAnchor}
								anchorOrigin={{
									vertical: "bottom",
									horizontal: "right",
								}}
								keepMounted
								transformOrigin={{
									vertical: "top",
									horizontal: "right",
								}}
								open={Boolean(userMenuAnchor)}
								onClose={handleUserMenuClose}
								PaperProps={{
									elevation: 3,
									sx: {
										minWidth: 180,
										borderRadius: "8px",
										mt: 1,
									},
								}}
							>
								<MenuItem
									onClick={handleProfile}
									sx={{
										padding: "10px 16px",
										"&:hover": { backgroundColor: theme.palette.action.hover },
									}}
								>
									{t("common.profile")}
								</MenuItem>
								<MenuItem
									onClick={handleLogout}
									sx={{
										padding: "10px 16px",
										"&:hover": { backgroundColor: theme.palette.action.hover },
									}}
								>
									{t("common.logout")}
								</MenuItem>
							</Menu>
						</>
					) : (
						<Button
							variant="contained"
							color="secondary"
							onClick={() => navigate(ROUTES.LOGIN)}
							sx={{
								borderRadius: "8px",
								padding: "8px 16px",
								textTransform: "none",
								fontWeight: 600,
								boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
								"&:hover": {
									boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
									transform: "translateY(-2px)",
								},
								transition: "all 0.3s ease",
							}}
						>
							{t("common.login")}
						</Button>
					)}
				</Box>
			</Toolbar>
		</AppBar>
	);
}
