/**
 * LanguageProvider.jsx
 *
 * This file sets up internationalization (i18n) for the app using `i18next` and React Context.
 * It allows switching between English (`en`) and Hebrew (`he`), and updates the UI direction
 * (LTR/RTL) accordingly.
 *
 * Features:
 * - Loads translations for English and Hebrew
 * - Uses `i18next-browser-languagedetector` to detect user language
 * - Sets document direction (LTR/RTL) and language attribute
 * - Adds body classes (`rtl-mode`, `ltr-mode`) for advanced RTL styling
 * - Provides a `LanguageContext` with current language and a change handler
 * - Offers a custom hook `useLanguage` for easy access to the context
 *
 * Technologies:
 * - i18next, react-i18next, i18next-browser-languagedetector
 * - React Context API
 * - useEffect, useState, PropTypes
 *
 * Exports:
 * - `LanguageProvider`: Context provider component to wrap the app
 * - `useLanguage`: Hook to access language state and change function
 */

import { createContext, useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { enTranslations } from "../translations/en";
import { heTranslations } from "../translations/he";
import { ruTranslations } from "../translations/ru";

// Initialize i18next
i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			en: { translation: enTranslations },
			he: { translation: heTranslations },
			ru: { translation: ruTranslations },
		},

		fallbackLng: "en",
		supportedLngs: ["en", "he", "ru"],
		load: "languageOnly",
		interpolation: { escapeValue: false },
		detection: { order: ["localStorage", "navigator"], caches: ["localStorage"] },
		debug: true,
	});


/**
 * LanguageProvider
 *
 * React provider component that wraps the app, providing language state and
 * the ability to change it. Also handles side effects:
 * - Changes i18next language
 * - Updates document direction (dir attribute)
 * - Updates document lang attribute
 * - Applies `rtl-mode` or `ltr-mode` classes to <body> for advanced styling
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Components that should have access to the language context
 */
export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
	const [language, setLanguage] = useState(i18n.language || "en");

	/**
   * Configure i18next:
   * - Detects language (localStorage → browser settings)
   * - Integrates with React
   * - Loads EN, HE, and RU translations
   * - Falls back to EN if missing
   * - Ignores region codes (e.g., ru-RU → ru)
   * - Saves chosen language in localStorage
   * - Debug mode enabled for development
   */
	const changeLanguage = (lang) => {
		i18n.changeLanguage(lang);
		setLanguage(lang);
		// Set document direction for RTL support
		document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
		document.documentElement.lang = lang;

		// Add CSS class for enhanced RTL styling
		if (lang === "he") {
			document.body.classList.add("rtl-mode");
			document.body.classList.remove("ltr-mode");
		} else {
			document.body.classList.add("ltr-mode");
			document.body.classList.remove("rtl-mode");
		}
	};
    /**
    * Effect: Runs when `language` changes
    * Ensures the document direction, lang attribute, and body classes are correct
    * after initialization or language change.
    */
	useEffect(() => {
		// Initial setup
		document.documentElement.dir = language === "he" ? "rtl" : "ltr";
		document.documentElement.lang = language;

		// Add initial CSS class
		if (language === "he") {
			document.body.classList.add("rtl-mode");
			document.body.classList.remove("ltr-mode");
		} else {
			document.body.classList.add("ltr-mode");
			document.body.classList.remove("rtl-mode");
		}
	}, [language]);

	return (
		<LanguageContext.Provider value={{ language, changeLanguage }}>
			{children}
		</LanguageContext.Provider>
	);
};

LanguageProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

// Custom hook for using the language context
export const useLanguage = () => useContext(LanguageContext);
