import { apiConfig } from "../api/config";

// Re-export the axios instance from the apiConfig for convenient importing
const { axiosInstance } = apiConfig;

export default axiosInstance;
