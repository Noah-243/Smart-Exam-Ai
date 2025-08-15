/**
 * FeedbackFieldsContext & Provider
 * --------------------------------
 * This context provides a centralized registry for feedback fields within the application.
 * It allows child components to register/unregister themselves and update their feedback text dynamically.
 *
 * Exports:
 * - FeedbackFieldsContext: The context to consume inside components.
 * - FeedbackFieldsProvider: A context provider that wraps parts of the app using feedback fields.
 *
 * Features:
 * - `registerField(id, fieldApi)`: Register a feedback field with a unique ID and its setter.
 * - `unregisterField(id)`: Remove a feedback field by ID.
 * - `updateAllFields(feedbackMap)`: Batch update feedback fields with new text.
 *
 * Usage:
 * <FeedbackFieldsProvider>
 *   ...your components that use the context...
 * </FeedbackFieldsProvider>
 */

import React, { useState } from "react";
import PropTypes from "prop-types";

// Create a simple context to store refs to feedback fields
const FeedbackFieldsContext = React.createContext({});

export const FeedbackFieldsProvider = ({ children }) => {
	const [feedbackFieldsRegistry, setFeedbackFieldsRegistry] = useState({
		fields: {},
		registerField: (id, fieldApi) => {
			setFeedbackFieldsRegistry((prev) => ({
				...prev,
				fields: {
					...prev.fields,
					[id]: fieldApi,
				},
			}));
		},
		unregisterField: (id) => {
			setFeedbackFieldsRegistry((prev) => {
				const newFields = { ...prev.fields };
				delete newFields[id];
				return {
					...prev,
					fields: newFields,
				};
			});
		},
		updateAllFields: (feedbackMap) => {
			Object.entries(feedbackMap).forEach(([id, text]) => {
				if (feedbackFieldsRegistry.fields[id]?.setFeedback) {
					feedbackFieldsRegistry.fields[id].setFeedback(text);
				}
			});
		},
	});

	return (
		<FeedbackFieldsContext.Provider value={feedbackFieldsRegistry}>
			{children}
		</FeedbackFieldsContext.Provider>
	);
};

FeedbackFieldsProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export default FeedbackFieldsContext;
