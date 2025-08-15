export const saveUserDataToStorage = (userData) => {
	localStorage.setItem("userData", JSON.stringify(userData));
};

export const getUserDataFromStorage = () => {
	const userData = localStorage.getItem("userData");
	return userData ? JSON.parse(userData) : null;
};
