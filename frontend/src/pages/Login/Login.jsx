/**
 * Grades Page
 *
 * This page displays all available grades in the system.
 * - Fetches grade data from the backend using the `getGrades` API.
 * - Displays grades as cards using the `GradeCard` component.
 * - Shows an error message if fetching fails or data is invalid.
 *
 * Hooks:
 * - useState: Manages grades list and error state.
 * - useEffect: Triggers API call when the component mounts.
 *
 * UI:
 * - MUI Grid layout for responsive cards.
 * - Error message shown via Typography if API call fails.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { login } from "../../api/auth";
import {
	Container,
	Box,
	TextField,
	Button,
	Typography,
	Paper,
	Alert,
	InputAdornment,
	IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const { login: setUser } = useUser();
	const navigate = useNavigate();

	useEffect(() => {
		const storedData = localStorage.getItem("SES-USER");
		if (storedData) {
			console.log("Existing user data found:", JSON.parse(storedData));
		} else {
			console.log("No stored user data found");
		}
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		// Log all form field values and verify the form was triggered
		console.log("Form submitted with fields:", {
			email: e.target.email?.value || email,
			password: e.target.password?.value || password,
			formElement: e.target,
			eventType: e.type,
		});

		try {
			console.log("Submitting login form:", { email, password });
			console.log("About to call login API...");

			// Try axios through our regular function
			let response;
			try {
				response = await login({ email, password });
				console.log("Login successful:", response);
			} catch (axiosError) {
				console.error(
					"Axios login failed, trying direct fetch as fallback:",
					axiosError
				);

				// If the axios call fails, try a direct fetch as fallback
				const fetchResponse = await fetch(
					"http://localhost:5000/api/auth/login",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ email, password }),
						credentials: "include",
					}
				);

				if (!fetchResponse.ok) {
					throw new Error(
						`Fetch error: ${fetchResponse.status} ${fetchResponse.statusText}`
					);
				}

				response = await fetchResponse.json();
				console.log("Fetch login successful:", response);
			}

			console.log("About to call setUser with:", response);
			setUser(response);
			console.log("setUser completed, about to navigate");
			navigate("/");
		} catch (err) {
			console.error("Login failed:", err);
			console.error("Error details:", {
				message: err.message,
				response: err.response?.data,
				status: err.response?.status,
			});
			setError(
				err.response?.data?.message ||
					err.response?.data?.error ||
					"Login failed"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleTogglePassword = () => {
		setShowPassword((prev) => !prev);
	};

return (
<Box
  sx={{
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  }}
>

  <video
  autoPlay
  muted
  loop
  playsInline
   ref={(video) => video && (video.playbackRate = 0.6)}
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 0,
  }}
>
  <source src="/videoplaybackLondon.mp4.mp4" type="video/mp4" />
</video>

			{/* Background Title */}
			<Typography
				variant="h1"
				sx={{
					position: "absolute",
					top: "30%",
					left: "50%",
					width:"100%",
					textAlign:"center",
					transform: "translateX(-50%)",
					fontSize: { xs: "3rem", sm: "5rem", md: "8rem", lg: "11rem" },
					fontWeight: 900,
					color: (theme) =>
						theme.palette.mode === "dark"
							? "rgba(240, 246, 252, 0.05)"
							: "rgba(33, 33, 33, 0.07)",
					userSelect: "none",
					pointerEvents: "none",
					letterSpacing: "-0.05em",
					lineHeight: 0.9,
					zIndex: 0,
				}}
			>
				{/*SMART EXAM AI*/}
			</Typography>

			{/* Decorative Elements */}
			<Box
				sx={{
					position: "absolute",
					top: "20%",
					right: "10%",
					width: "200px",
					height: "200px",
					borderRadius: "50%",
					background: (theme) =>
						`linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
					filter: "blur(100px)",
					animation: "float 6s ease-in-out infinite",
					"@keyframes float": {
						"0%, 100%": { transform: "translateY(0px)" },
						"50%": { transform: "translateY(-20px)" },
					},
				}}
			/>
			<Box
				sx={{
					position: "absolute",
					bottom: "20%",
					left: "15%",
					width: "150px",
					height: "150px",
					borderRadius: "50%",
					background: (theme) =>
						`linear-gradient(135deg, ${theme.palette.secondary.main}15, ${theme.palette.primary.main}15)`,
					filter: "blur(80px)",
					animation: "float 8s ease-in-out infinite reverse",
				}}
			/>

			{/* Login Form Container */}
			<Container
				component="main"
				maxWidth="xs"
				sx={{ position: "relative", zIndex: 1 }}
			>
				<Paper
					elevation={24}
					sx={{
						opacity:0.8,
						backdropFilter: "blur(20px)",
						WebkitBackdropFilter: "blur(20px)",
						width: { xs: "100%", sm: "400px" },
                        mx: "auto",
                        p: { xs: 3, sm: 6 },
						background: (theme) =>
							theme.palette.mode === "dark"
								? "rgba(22, 27, 34, 0.85)"
								: "rgba(255, 255, 255, 0.90)",
						border: (theme) =>
							theme.palette.mode === "dark"
								? "1px solid rgba(240, 246, 252, 0.1)"
								: "1px solid rgba(33, 33, 33, 0.08)",
						borderRadius: 15,
						p: 6,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						boxShadow: (theme) =>
							theme.palette.mode === "dark"
								? "0 8px 32px rgba(0, 0, 0, 0.4)"
								: "0 8px 32px rgba(0, 0, 0, 0.15)",
						animation: "slideUp 0.6s ease-out",
						"@keyframes slideUp": {
							"0%": {
								opacity: 4,
								transform: "translateY(30px)",
							},
							"100%": {
								opacity: 1,
								transform: "translateY(0)",
							},
						},
					}}
				>
					<Typography
  variant="h5"
  component="div"
  sx={{
    width: "100%",
    textAlign: "center",
    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.2rem" },
    color: (theme) =>
      theme.palette.mode === "dark"
        ? "#F3F4F6"
        : "#1E1E1E",
    mb: 2,
  }}
>
  SMART EXAM AI
</Typography>
					{/* Logo Icon */}
					<Box
						sx={{
							width: 64,
							height: 64,
							borderRadius: "50%",
							background: (theme) =>
								`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							mb: 1,
							boxShadow: (theme) =>
								`0 8px 24px ${theme.palette.primary.main}30`,
							animation: "pulse 2s ease-in-out infinite",
							"@keyframes pulse": {
								"0%, 100%": {
									boxShadow: (theme) =>
										`0 8px 24px ${theme.palette.primary.main}30`,
								},
								"50%": {
									boxShadow: (theme) =>
										`0 12px 32px ${theme.palette.primary.main}50`,
								},
							},
						}}
					>
						<LockOutlinedIcon
							sx={{
								color: (theme) => theme.palette.primary.contrastText,
								fontSize: 32,
							}}
						/>
					</Box>

					{/* Welcome Text */}
					<Typography
						component="h1"
						variant="h4"
						gutterBottom
						sx={{
							fontWeight: 700,
							mb: 1,
							background: (theme) =>
								`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
							backgroundClip: "text",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							color: (theme) => theme.palette.text.primary, // Fallback for browsers that don't support gradient text
						}}
					>
						Welcome Back
					</Typography>

					<Typography
						variant="body1"
						color="text.secondary"
						sx={{
							mb: 4,
							textAlign: "center",
							fontWeight: 500,
						}}
					>
						Sign in to access your exam platform
					</Typography>

					{/* Error Alert */}
					{error && (
						<Alert
							severity="error"
							sx={{
								width: "100%",
								mb: 3,
								borderRadius: 2,
								animation: "shake 0.5s ease-in-out",
								"@keyframes shake": {
									"0%, 100%": { transform: "translateX(0)" },
									"25%": { transform: "translateX(-5px)" },
									"75%": { transform: "translateX(5px)" },
								},
								backgroundColor: (theme) =>
									theme.palette.mode === "dark"
										? "rgba(244, 67, 54, 0.1)"
										: "rgba(244, 67, 54, 0.05)",
								color: (theme) => theme.palette.error.main,
								border: (theme) => `1px solid ${theme.palette.error.main}40`,
							}}
						>
							{error}
						</Alert>
					)}

					{/* Login Form */}
					<Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
						<TextField
							margin="normal"
							required
							fullWidth
							id="email"
							label="Email Address"
							name="email"
							autoComplete="email"
							autoFocus
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							sx={{
								mb: 3,
								"& .MuiOutlinedInput-root": {
									borderRadius: 3,
									transition: "all 0.3s ease",
									backgroundColor: (theme) =>
										theme.palette.mode === "dark"
											? "rgba(240, 246, 252, 0.02)"
											: "rgba(255, 255, 255, 0.8)",
									"&:hover": {
										backgroundColor: (theme) =>
											theme.palette.mode === "dark"
												? "rgba(240, 246, 252, 0.04)"
												: "rgba(255, 255, 255, 0.9)",
										"& .MuiOutlinedInput-notchedOutline": {
											borderColor: "primary.main",
										},
									},
									"&.Mui-focused": {
										backgroundColor: (theme) =>
											theme.palette.mode === "dark"
												? "rgba(240, 246, 252, 0.06)"
												: "rgba(255, 255, 255, 1)",
										"& .MuiOutlinedInput-notchedOutline": {
											borderWidth: "2px",
										},
									},
								},
								"& .MuiInputLabel-root": {
									fontWeight: 500,
									color: (theme) => theme.palette.text.secondary,
								},
								"& .MuiInputBase-input": {
									color: (theme) => theme.palette.text.primary,
								},
							}}
						/>

						<TextField
							margin="normal"
							required
							fullWidth
							name="password"
							label="Password"
							type={showPassword ? "text" : "password"}
							id="password"
							autoComplete="current-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											aria-label="toggle password visibility"
											onClick={handleTogglePassword}
											edge="end"
											sx={{
												color: "text.secondary",
												"&:hover": {
													color: "primary.main",
													backgroundColor: (theme) =>
														theme.palette.mode === "dark"
															? "rgba(240, 246, 252, 0.05)"
															: "rgba(0, 0, 0, 0.04)",
												},
											}}
										>
											{showPassword ? <VisibilityOff /> : <Visibility />}
										</IconButton>
									</InputAdornment>
								),
							}}
							sx={{
								mb: 4,
								"& .MuiOutlinedInput-root": {
									borderRadius: 3,
									transition: "all 0.3s ease",
									backgroundColor: (theme) =>
										theme.palette.mode === "dark"
											? "rgba(240, 246, 252, 0.02)"
											: "rgba(255, 255, 255, 0.8)",
									"&:hover": {
										backgroundColor: (theme) =>
											theme.palette.mode === "dark"
												? "rgba(240, 246, 252, 0.04)"
												: "rgba(255, 255, 255, 0.9)",
										"& .MuiOutlinedInput-notchedOutline": {
											borderColor: "primary.main",
										},
									},
									"&.Mui-focused": {
										backgroundColor: (theme) =>
											theme.palette.mode === "dark"
												? "rgba(240, 246, 252, 0.06)"
												: "rgba(255, 255, 255, 1)",
										"& .MuiOutlinedInput-notchedOutline": {
											borderWidth: "2px",
										},
									},
								},
								"& .MuiInputLabel-root": {
									fontWeight: 500,
									color: (theme) => theme.palette.text.secondary,
								},
								"& .MuiInputBase-input": {
									color: (theme) => theme.palette.text.primary,
								},
							}}
						/>

						<Button
							type="submit"
							fullWidth
							variant="contained"
							disabled={isLoading}
							sx={{
								py: 2,
								fontWeight: 600,
								fontSize: "1rem",
								borderRadius: 3,
								background: (theme) =>
									`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
								color: (theme) => theme.palette.primary.contrastText,
								"&:hover": {
									background: (theme) =>
										`linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
									transform: "translateY(-2px)",
									boxShadow: (theme) =>
										`0 12px 24px ${theme.palette.primary.main}30`,
								},
								"&:active": {
									transform: "translateY(0)",
								},
								"&:disabled": {
									background: (theme) =>
										theme.palette.action.disabledBackground,
									color: (theme) => theme.palette.action.disabled,
								},
								transition: "all 0.3s ease",
								boxShadow: (theme) =>
									`0 8px 16px ${theme.palette.primary.main}25`,
							}}
						>
							{isLoading ? "Signing in..." : "Sign In"}
						</Button>
					</Box>

					{/* Footer Text */}
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{
							mt: 4,
							textAlign: "center",
							fontWeight: 500,
							opacity: 0.8,
						}}
					>
						Secure • Reliable • Smart
					</Typography>
				</Paper>
			</Container>
		</Box>
	);
}
