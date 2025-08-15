/**
 * userAPI.js – User Management API
 *
 * This module provides functions to interact with the backend API for managing users.
 * It supports full CRUD operations using a shared axiosInstance.
 *
 * Functions:
 * ▸ createUser(userData): Create a new user.
 * ▸ getUsers(): Retrieve all users.
 * ▸ getUserById(id): Retrieve a user by their ID.
 * ▸ updateUser(id, userData): Update user information.
 * ▸ deleteUser(id): Delete a user by their ID.
 *
 * Notes:
 * - All API requests are made via the configured axiosInstance.
 * - Returns raw server response data to the calling component.
 */

import { apiConfig } from "./config";
const { axiosInstance } = apiConfig;

// Create a new user
export const createUser = async (userData) => {
	const response = await axiosInstance.post("/users", userData);
	return response.data;
};

// Get all users
export const getUsers = async () => {
	const response = await axiosInstance.get("/users");
	return response.data;
};

// Get a single user by ID
export const getUserById = async (id) => {
	const response = await axiosInstance.get(`/users/${id}`);
	return response.data;
};

// Update a user
export const updateUser = async (id, userData) => {
	const response = await axiosInstance.put(`/users/${id}`, userData);
	return response.data;
};

// Delete a user
export const deleteUser = async (id) => {
	const response = await axiosInstance.delete(`/users/${id}`);
	return response.data;
};
