/**
 * UserList.jsx
 *
 * This component fetches and displays a list of users from the server.
 * When the component mounts, it calls the `getUsers` API function to
 * retrieve user data and stores it in local state.
 *
 * Features:
 * - Uses `useEffect` to fetch user data once on component load
 * - Stores the users in local state with `useState`
 * - Displays each user's name and email in a list
 *
 * Technologies used:
 * - React (useState, useEffect)
 * - External API function `getUsers` from `../api/users`
 *
 * @returns {JSX.Element} The rendered list of users
 */

import React, { useEffect, useState } from "react";
import { getUsers } from "../api/users";

const UserList = () => {
	const [users, setUsers] = useState([]);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const data = await getUsers();
				setUsers(data.data);
			} catch (error) {
				console.error("Error fetching users:", error);
			}
		};

		fetchUsers();
	}, []);

	return (
		<div>
			<h1>User List</h1>
			<ul>
				{users.map((user) => (
					<li key={user._id}>
						{user.name} - {user.email}
					</li>
				))}
			</ul>
		</div>
	);
};

export default UserList;
