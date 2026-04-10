const { app } = require('@azure/functions')
const { getConnection, sql } = require('../db.js')

app.http('create-comment', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const body = await request.json()
      const { candidateId, requisitionId, authorName, role, commentText, rating } = body

      if (!candidateId || !role || !commentText) {
        return { status: 400, body: JSON.stringify({ error: 'candidateId, role, and commentText are required' }) }
      }

      const validRoles = ['HiringManager', 'HRAdmin', 'Director']
      if (!validRoles.includes(role)) {
        return { status: 400, body: JSON.stringify({ error: `role must be one of: ${validRoles.join(', ')}` }) }
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
