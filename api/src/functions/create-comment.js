const { app } = require('@azure/functions')
const { getConnection, sql } = require('../db.js')

const ROLE_MAP = {
  'hr-admin': 'HRAdmin',
  'hiring-manager': 'HiringManager',
  'director': 'Director'
}

function getUserRoles(request) {
  const header = request.headers.get('x-ms-client-principal')
  if (!header) return []
  try {
    const decoded = Buffer.from(header, 'base64').toString('utf-8')
    const principal = JSON.parse(decoded)
    return principal.userRoles || []
  } catch {
    return []
  }
}

app.http('create-comment', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const userRoles = getUserRoles(request)
      context.log('User roles:', userRoles)

      if (userRoles.length === 0) {
        return { status: 401, body: JSON.stringify({ error: 'Authentication required. Please login.' }) }
      }

      const validRoles = ['hr-admin', 'hiring-manager', 'director']
      const userRole = userRoles.find(r => validRoles.includes(r))
      if (!userRole) {
        return { status: 403, body: JSON.stringify({ error: 'User does not have a valid role to add comments' }) }
      }

      const role = ROLE_MAP[userRole]
      context.log(`Creating comment as: ${role}`)

      const body = await request.json()
      const { candidateId, requisitionId, authorName, commentText, rating } = body

      if (!candidateId || !commentText) {
        return { status: 400, body: JSON.stringify({ error: 'candidateId and commentText are required' }) }
      }

      const pool = await getConnection()
      const result = await pool.request()
        .input('candidateId', sql.Int, parseInt(candidateId))
        .input('requisitionId', sql.Int, requisitionId ? parseInt(requisitionId) : null)
        .input('authorName', sql.NVarChar(100), authorName || null)
        .input('role', sql.NVarChar(50), role)
        .input('commentText', sql.NVarChar(sql.MAX), commentText)
        .input('rating', sql.Int, rating ? parseInt(rating) : null)
        .query(`
          INSERT INTO Comments (CandidateId, RequisitionId, AuthorName, Role, CommentText, Rating)
          OUTPUT INSERTED.*
          VALUES (@candidateId, @requisitionId, @authorName, @role, @commentText, @rating)
        `)

      context.log('Created comment for candidate:', candidateId, 'by', role)
      return {
        status: 201,
        body: JSON.stringify({ message: 'Comment added', comment: result.recordset[0] })
      }
    } catch (err) {
      context.error('Create comment error:', err)
      return { status: 500, body: JSON.stringify({ error: err.message }) }
    }
  }
})
