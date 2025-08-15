/**
 * LanguageSelector Component
 *
 * Allows users to switch between supported languages (English and Hebrew)
 * using a dropdown menu triggered by a language icon button.
 * Integrates with i18next and a custom LanguageContext for localization.
 */

import React from "react";
import { IconButton, Menu, MenuItem, Typography } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "react-i18next";

const LanguageSelector = () => {
	const { t } = useTranslation();
	const { language, changeLanguage } = useLanguage();
	const [anchorEl, setAnchorEl] = React.useState(null);

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleLanguageChange = (lang) => {
		changeLanguage(lang);
		handleClose();
	};

	return (
		<>
			<IconButton
				color="inherit"
				aria-label={t("common.language")}
				aria-controls="language-menu"
				aria-haspopup="true"
				onClick={handleClick}
				sx={{ ml: 1 }}
			>
				<LanguageIcon />
			</IconButton>
			<Menu
				id="language-menu"
				anchorEl={anchorEl}
				keepMounted
				open={Boolean(anchorEl)}
				onClose={handleClose}
			>
				<MenuItem
					onClick={() => handleLanguageChange("en")}
					selected={language === "en"}
				>
					<Typography variant="body1">English</Typography>
				</MenuItem>
				<MenuItem
					onClick={() => handleLanguageChange("he")}
					selected={language === "he"}
				>
					<Typography variant="body1">עברית</Typography>
				</MenuItem>
				<MenuItem
					onClick={() => handleLanguageChange("ru")}
					selected={language === "ru"}
				>
					<Typography variant="body1">Русский</Typography>
				</MenuItem>
			</Menu>
		</>
	);
};

export default LanguageSelector;
