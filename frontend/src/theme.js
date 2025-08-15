import { createTheme } from "@mui/material";

// Refined, professional palette tuned for high‑readability in edu‑platforms
const colors = {
	// Primary – clear, modern blue (accessible contrast)
	primary: {
		50: "#E9F2FF",
		100: "#C8DEFF",
		200: "#A5C8FF",
		300: "#7FB0FF",
		400: "#5A98FF",
		500: "#317AFF", // main light‑mode
		600: "#1765F6", // brand main
		700: "#0E54D9",
		800: "#0744B7",
		900: "#073693",
	},
	// Secondary – balanced violet accent
	secondary: {
		50: "#F5F3FF",
		100: "#EDE9FE",
		200: "#DDD6FE",
		300: "#C4B5FD",
		400: "#A78BFA",
		500: "#8B5CF6", // main light‑mode
		600: "#7C3AED", // brand main
		700: "#6D28D9",
		800: "#5B21B6",
		900: "#4C1D95",
	},
	// Success – fresh green (MD3 compliant)
	success: {
		50: "#ECFDF5",
		100: "#D1FADF",
		200: "#A7F3C0",
		300: "#6EE7B7",
		400: "#34D399",
		500: "#10B981", // main
		600: "#059669",
		700: "#047857",
		800: "#065F46",
		900: "#064E3B",
	},
	// Warning – amber (unchanged, already optimal)
	warning: {
		50: "#FFFBEB",
		100: "#FEF3C7",
		200: "#FDE68A",
		300: "#FCD34D",
		400: "#FBBF24",
		500: "#F59E0B",
		600: "#D97706",
		700: "#B45309",
		800: "#92400E",
		900: "#78350F",
	},
	// Error – tuned crimson (kept)
	error: {
		50: "#FEF2F2",
		100: "#FEE2E2",
		200: "#FECACA",
		300: "#FCA5A5",
		400: "#F87171",
		500: "#EF4444",
		600: "#DC2626",
		700: "#B91C1C",
		800: "#991B1B",
		900: "#7F1D1D",
	},
	// Info – sky blue
	info: {
		50: "#EFF6FF",
		100: "#DBEAFE",
		200: "#BFDBFE",
		300: "#93C5FD",
		400: "#60A5FA",
		500: "#3B82F6", // main
		600: "#2563EB",
		700: "#1D4ED8",
		800: "#1E40AF",
		900: "#1E3A8A",
	},
	// Layer tokens – updated per specification
	lightLayers: {
		background: "#c9ccd1", // Much darker blue-gray app background (50% darker than #DDE1E7)
		surface: "#E8EAED", // Lighter section/card surface for better contrast (was #CDD3DB)
		elevated: "#c9ccd1", // Even lighter panel/modal elevated surface (was #BCC4CF)
	},
	darkLayers: {
		background: "#1E1E2F", // Neutral graphite background
		surface: "#2A2B3D", // Card surface - +4% lightness
		elevated: "#3A3B4D", // Elevated surface for modals/hover
	},
	// Text hues (WCAG ≥4.5)
	lightText: {
		primary: "#1E1E1E", // Near-black for fatigue-free reading
		secondary: "#374151", // Slate-700 for metadata
		tertiary: "#6B7280", // Lighter gray for subtle text
	},
	darkText: {
		primary: "#F8F8F2", // Light slate-100 for crisp contrast
		secondary: "#D1D5DB", // Slate-300 for secondary text
		tertiary: "#9CA3AF", // Slate-400 for subtle text
	},
};

// Common theme settings
const themeSettings = {
	typography: {
		fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
		h1: {
			fontSize: "2.5rem",
			fontWeight: 700,
			letterSpacing: "-0.02em",
		},
		h2: {
			fontSize: "2rem",
			fontWeight: 600,
			letterSpacing: "-0.01em",
		},
		h3: {
			fontSize: "1.75rem",
			fontWeight: 600,
			letterSpacing: "-0.01em",
		},
		h4: {
			fontSize: "1.5rem",
			fontWeight: 500,
			letterSpacing: "0em",
		},
		h5: {
			fontSize: "1.25rem",
			fontWeight: 500,
			letterSpacing: "0em",
		},
		h6: {
			fontSize: "1rem",
			fontWeight: 500,
			letterSpacing: "0.01em",
		},
		body1: {
			fontSize: "1rem",
			lineHeight: 1.6,
			letterSpacing: "0.00938em",
		},
		body2: {
			fontSize: "0.875rem",
			lineHeight: 1.5,
			letterSpacing: "0.01071em",
		},
	},
	shape: {
		borderRadius: 3,
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: "none",
					borderRadius: 12,
					fontWeight: 500,
					fontSize: "0.875rem",
					padding: "8px 16px",
					boxShadow: "none",
					"&:hover": {
						boxShadow: "0px 2px 8px rgba(0,0,0,0.12)",
					},
				},
				contained: {
					"&:hover": {
						boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 7,
					"&:hover": {
						boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
					},
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: 0,
				},
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					"& .MuiOutlinedInput-root": {
						borderRadius: 12,
					},
				},
			},
		},
	},
};

export const lightTheme = createTheme({
	...themeSettings,
	palette: {
		mode: "light",
		primary: {
			main: colors.primary[600],
			light: colors.primary[400],
			dark: colors.primary[700],
			contrastText: "#ffffff",
		},
		secondary: {
			main: colors.secondary[600],
			light: colors.secondary[400],
			dark: colors.secondary[700],
			contrastText: "#ffffff",
		},
		error: {
			main: colors.error[500],
			light: colors.error[400],
			dark: colors.error[700],
			contrastText: "#ffffff",
		},
		warning: {
			main: colors.warning[500],
			light: colors.warning[400],
			dark: colors.warning[700],
			contrastText: "#ffffff",
		},
		info: {
			main: colors.info[500],
			light: colors.info[400],
			dark: colors.info[700],
			contrastText: "#ffffff",
		},
		success: {
			main: colors.success[500],
			light: colors.success[400],
			dark: colors.success[700],
			contrastText: "#ffffff",
		},
		background: {
			default: colors.lightLayers.background, // #8B8F95 - much darker blue-gray background
			paper: colors.lightLayers.surface, // #E8EAED - lighter section/card surface
			elevated: colors.lightLayers.elevated, // #F1F3F6 - even lighter panel/modal elevated surface
		},
		text: {
			primary: colors.lightText.primary, // #1E1E1E - near-black for readability
			secondary: colors.lightText.secondary, // #374151 - slate-700 for metadata
		},
		divider: "#D1D5DB",
		action: {
			hover: colors.lightLayers.elevated, // #F1F3F6 - even lighter panel/modal elevated surface
			selected: colors.lightLayers.elevated,
			disabled: "rgba(30, 30, 30, 0.26)",
			disabledBackground: "rgba(30, 30, 30, 0.12)",
		},
	},
	shadows: [
		"none",
		"0px 1px 2px 0px rgba(30, 30, 30, 0.08)",
		"0px 1px 3px 0px rgba(30, 30, 30, 0.10), 0px 1px 2px 0px rgba(30, 30, 30, 0.06)",
		"0px 4px 6px -1px rgba(30, 30, 30, 0.10), 0px 2px 4px -1px rgba(30, 30, 30, 0.06)",
		"0px 10px 15px -3px rgba(30, 30, 30, 0.10), 0px 4px 6px -2px rgba(30, 30, 30, 0.05)",
		"0px 20px 25px -5px rgba(30, 30, 30, 0.10), 0px 10px 10px -5px rgba(30, 30, 30, 0.04)",
		"0px 25px 50px -12px rgba(30, 30, 30, 0.20)",
		"0px 25px 50px -12px rgba(30, 30, 30, 0.20)",
		"0px 25px 50px -12px rgba(30, 30, 30, 0.20)",
		"0px 25px 50px -12px rgba(30, 30, 30, 0.20)",
		"0px 25px 50px -12px rgba(30, 30, 30, 0.20)",
		"0px 25px 50px -12px rgba(30, 30, 30, 0.20)",
		"0px 25px 50px -12px rgba(30, 30, 30, 0.20)",
		"0px 25px 50px -12px rgba(30, 30, 30, 0.20)",
		"0px 25px 50px -12px rgba(30, 30, 30, 0.20)",
		"0px 25px 50px -12px rgba(30, 30, 30, 0.20)",
		"0px 25px 50px -12px rgba(30, 30, 30, 0.20)",
		"0px 25px 50px -12px rgba(30, 30, 30, 0.20)",
		"0px 25px 50px -12px rgba(30, 30, 30, 0.20)",
		"0px 25px 50px -12px rgba(30, 30, 30, 0.20)",
		"0px 25px 50px -12px rgba(30, 30, 30, 0.20)",
		"0px 25px 50px -12px rgba(30, 30, 30, 0.20)",
		"0px 25px 50px -12px rgba(30, 30, 30, 0.20)",
		"0px 25px 50px -12px rgba(30, 30, 30, 0.20)",
		"0px 25px 50px -12px rgba(30, 30, 30, 0.20)",
	],
});

export const darkTheme = createTheme({
	...themeSettings,
	palette: {
		mode: "dark",
		primary: {
			main: colors.primary[400],
			light: colors.primary[300],
			dark: colors.primary[500],
			contrastText: colors.darkLayers.background,
		},
		secondary: {
			main: colors.secondary[400],
			light: colors.secondary[300],
			dark: colors.secondary[500],
			contrastText: colors.darkLayers.background,
		},
		error: {
			main: colors.error[400],
			light: colors.error[300],
			dark: colors.error[500],
			contrastText: colors.darkLayers.background,
		},
		warning: {
			main: colors.warning[400],
			light: colors.warning[300],
			dark: colors.warning[500],
			contrastText: colors.darkLayers.background,
		},
		info: {
			main: colors.info[400],
			light: colors.info[300],
			dark: colors.info[500],
			contrastText: colors.darkLayers.background,
		},
		success: {
			main: colors.success[400],
			light: colors.success[300],
			dark: colors.success[500],
			contrastText: colors.darkLayers.background,
		},
		background: {
			default: colors.darkLayers.background, // #1A1D24 - neutral graphite background
			paper: colors.darkLayers.surface, // #22272E - card surface
			elevated: colors.darkLayers.elevated, // #2B3138 - elevated surface for modals/hover
		},
		text: {
			primary: colors.darkText.primary, // #F3F4F6 - light slate for crisp contrast
			secondary: colors.darkText.secondary, // #D1D5DB - slate-300 for secondary text
		},
		divider: "#374151",
		action: {
			hover: colors.darkLayers.elevated, // #2B3138 - elevated surface for hover
			selected: colors.darkLayers.elevated,
			disabled: "rgba(243, 244, 246, 0.3)",
			disabledBackground: "rgba(243, 244, 246, 0.12)",
		},
	},
	shadows: [
		"none",
		"0px 1px 2px 0px rgba(0, 0, 0, 0.25)",
		"0px 1px 3px 0px rgba(0, 0, 0, 0.30), 0px 1px 2px 0px rgba(0, 0, 0, 0.20)",
		"0px 4px 6px -1px rgba(0, 0, 0, 0.30), 0px 2px 4px -1px rgba(0, 0, 0, 0.20)",
		"0px 10px 15px -3px rgba(0, 0, 0, 0.30), 0px 4px 6px -2px rgba(0, 0, 0, 0.15)",
		"0px 20px 25px -5px rgba(0, 0, 0, 0.30), 0px 10px 10px -5px rgba(0, 0, 0, 0.10)",
		"0px 25px 50px -12px rgba(0, 0, 0, 0.45)",
		"0px 25px 50px -12px rgba(0, 0, 0, 0.45)",
		"0px 25px 50px -12px rgba(0, 0, 0, 0.45)",
		"0px 25px 50px -12px rgba(0, 0, 0, 0.45)",
		"0px 25px 50px -12px rgba(0, 0, 0, 0.45)",
		"0px 25px 50px -12px rgba(0, 0, 0, 0.45)",
		"0px 25px 50px -12px rgba(0, 0, 0, 0.45)",
		"0px 25px 50px -12px rgba(0, 0, 0, 0.45)",
		"0px 25px 50px -12px rgba(0, 0, 0, 0.45)",
		"0px 25px 50px -12px rgba(0, 0, 0, 0.45)",
		"0px 25px 50px -12px rgba(0, 0, 0, 0.45)",
		"0px 25px 50px -12px rgba(0, 0, 0, 0.45)",
		"0px 25px 50px -12px rgba(0, 0, 0, 0.45)",
		"0px 25px 50px -12px rgba(0, 0, 0, 0.45)",
		"0px 25px 50px -12px rgba(0, 0, 0, 0.45)",
		"0px 25px 50px -12px rgba(0, 0, 0, 0.45)",
		"0px 25px 50px -12px rgba(0, 0, 0, 0.45)",
		"0px 25px 50px -12px rgba(0, 0, 0, 0.45)",
	],
});
