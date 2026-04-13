/**
 * API authentication helper for Azure Static Web Apps
 * Validates user roles from the x-ms-client-principal header
 * SWA automatically forwards this header to linked Function Apps
 */

/**
 * Get the client principal from the request headers
 * @param {object} request - Azure Function request object
 * @returns {object|null} - Decoded client principal or null
 */
function getClientPrincipal(request) {
  try {
    const header = request.headers.get('x-ms-client-principal')
    if (!header) return null

    const decoded = JSON.parse(
      Buffer.from(header, 'base64').toString('utf8')
    )
    return decoded
  } catch (e) {
    return null
  }
}

/**
 * Check if the request has a specific role
 * @param {object} request - Azure Function request object
 * @param {string} role - Required role (e.g., "hr-admin", "hiring-manager", "director")
 * @returns {{ authorized: boolean, principal: object|null, roles: string[] }}
 */
function checkRole(request, role) {
  const principal = getClientPrincipal(request)
  if (!principal) {
    return { authorized: false, principal: null, roles: [] }
  }

  const roles = principal.userRoles || []
  const authorized = roles.includes(role)

  return { authorized, principal, roles }
}

/**
 * Check if the request has any of the specified roles
 * @param {object} request - Azure Function request object
 * @param {string[]} roles - Array of allowed roles
 * @returns {{ authorized: boolean, principal: object|null, roles: string[] }}
 */
function checkAnyRole(request, roles) {
  const principal = getClientPrincipal(request)
  if (!principal) {
    return { authorized: false, principal: null, roles: [] }
  }

  const userRoles = principal.userRoles || []
  const authorized = roles.some(role => userRoles.includes(role))

  return { authorized, principal, roles: userRoles }
}

/**
 * Require a specific role - returns 403 response if not authorized
 * @param {object} request - Azure Function request object
 * @param {string} role - Required role
 * @returns {{ authorized: boolean, principal: object|null, forbiddenResponse: object|null }}
 */
function requireRole(request, role) {
  const result = checkRole(request, role)
  if (!result.authorized) {
    return {
      authorized: false,
      principal: result.principal,
      forbiddenResponse: {
        status: 403,
        body: JSON.stringify({ error: "Forbidden - insufficient permissions", requiredRole: role })
      }
    }
  }
  return { authorized: true, principal: result.principal, forbiddenResponse: null }
}

/**
 * Require any of the specified roles - returns 403 response if not authorized
 * @param {object} request - Azure Function request object
 * @param {string[]} roles - Array of allowed roles
 * @returns {{ authorized: boolean, principal: object|null, forbiddenResponse: object|null }}
 */
function requireAnyRole(request, roles) {
  const result = checkAnyRole(request, roles)
  if (!result.authorized) {
    return {
      authorized: false,
      principal: result.principal,
      forbiddenResponse: {
        status: 403,
        body: JSON.stringify({ error: "Forbidden - insufficient permissions", requiredRoles: roles })
      }
    }
  }
  return { authorized: true, principal: result.principal, forbiddenResponse: null }
}

module.exports = {
  getClientPrincipal,
  checkRole,
  checkAnyRole,
  requireRole,
  requireAnyRole
}