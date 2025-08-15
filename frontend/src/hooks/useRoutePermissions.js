/**
 * useRoutePermissions
 *
 * A custom React hook that provides route-based access control based on user roles.
 * It integrates with the `UserContext` to determine the currently logged-in user's role
 * and compares it against the allowed roles for each route defined in `ROUTE_ACCESS`.
 *
 * Features:
 * - Prevents access to routes based on user role
 * - Falls back to allowing access if no roles are defined for a given route
 *
 * Returns:
 * {
 *   canAccessRoute: function(path): boolean
 *     - Checks whether the current user is allowed to access the specified path
 * }
 *
 * Example:
 * ```js
 * const { canAccessRoute } = useRoutePermissions();
 * const isAllowed = canAccessRoute("/admin");
 * ```
 *
 * Dependencies:
 * - useUser: for retrieving current user info
 * - ROUTE_ACCESS: route-role mapping configuration
 */

import { useUser } from "../contexts/UserContext";
import { ROUTE_ACCESS } from "../routes/routeConfig.jsx";

export const useRoutePermissions = () => {
	const { user } = useUser();

	const canAccessRoute = (path) => {
		if (!user) return false;

		const allowedRoles = ROUTE_ACCESS[path];
		if (!allowedRoles) return true; // If no roles specified, allow access

		return allowedRoles.includes(user.role);
	};

	return { canAccessRoute };
};
