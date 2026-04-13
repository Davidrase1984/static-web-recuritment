/**
 * Auth utility for Azure Static Web Apps authentication
 * Fetches user info from /.auth/me and provides role-based helpers
 */

let cachedUser = null

/**
 * Fetch the current authenticated user from SWA /.auth/me endpoint
 * Returns { clientPrincipal: { userId, userDetails, userRoles, ... } } or null
 */
export async function fetchUser() {
  try {
    const response = await fetch("/.auth/me")
    if (response.ok) {
      const data = await response.json()
      cachedUser = data.clientPrincipal ? data : null
    } else {
      cachedUser = null
    }
  } catch (e) {
    cachedUser = null
  }
  return cachedUser
}

/**
 * Get the cached user (call fetchUser first)
 */
export function getUser() {
  return cachedUser
}

/**
 * Check if the user is authenticated
 */
export function isAuthenticated() {
  return cachedUser && cachedUser.clientPrincipal !== null
}

/**
 * Get the user's display name
 */
export function getUserName() {
  if (cachedUser && cachedUser.clientPrincipal) {
    return cachedUser.clientPrincipal.userDetails
  }
  return ""
}

/**
 * Get the user's roles array
 */
export function getUserRoles() {
  if (cachedUser && cachedUser.clientPrincipal) {
    return cachedUser.clientPrincipal.userRoles || []
  }
  return []
}

/**
 * Check if the user has a specific role
 * @param {string} role - The role to check (e.g., "hr-admin", "hiring-manager", "director")
 */
export function hasRole(role) {
  return getUserRoles().includes(role)
}

/**
 * Check if the user has any of the specified roles
 * @param {string[]} roles - Array of roles to check
 */
export function hasAnyRole(roles) {
  const userRoles = getUserRoles()
  return roles.some(role => userRoles.includes(role))
}