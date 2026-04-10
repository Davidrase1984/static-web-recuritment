const { app } = require('@azure/functions')
const { getConnection, sql } = require('../db.js')

const STAGES = {
  1: 'Applied',
  2: 'Screening',
  3: 'Technical Interview',
  4: 'Technical Selected',
  5: 'Technical Rejected',
  6: 'Technical Hold',
  7: 'HR Selected',
  8: 'HR Rejected',
  9: 'HR Hold',
  10: 'Director Review',
  11: 'Director Selected',
  12: 'Director Rejected',
  13: 'Offer Released',
  14: 'Offer Accepted',
  15: 'Offer Revoked'
}

const PERMISSIONS = {
  'Applied': { roles: ['HRAdmin'], nextStages: [2] },
  'Screening': { roles: ['HRAdmin'], nextStages: [3, 8, 9] },
  'Technical Interview': { roles: ['HiringManager'], nextStages: [4, 5, 6] },
  'Technical Selected': { roles: ['HRAdmin'], nextStages: [7, 8, 9] },
  'Technical Rejected': { roles: ['HRAdmin'], nextStages: [] },
  'Technical Hold': { roles: ['HRAdmin'], nextStages: [3, 8, 9] },
  'HR Selected': { roles: ['Director'], nextStages: [10, 12] },
  'HR Rejected': { roles: ['Director'], nextStages: [] },
  'HR Hold': { roles: ['Director'], nextStages: [10, 12] },
  'Director Review': { roles: ['Director'], nextStages: [11, 12] },
  'Director Selected': { roles: ['HRAdmin'], nextStages: [13] },
  'Director Rejected': { roles: ['HRAdmin'], nextStages: [] },
  'Offer Released': { roles: ['HRAdmin'], nextStages: [14, 15] },
  'Offer Accepted': { roles: ['HRAdmin'], nextStages: [] },
  'Offer Revoked': { roles: ['HRAdmin'], nextStages: [] }
}

app.http('stage-transition', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const body = await request.json()
      const { candidateId, toStage, role, changedBy, notes } = body

      if (!candidateId || !toStage || !role) {
        return { status: 400, body: JSON.stringify({ error: 'candidateId, toStage, and role are required' }) }
      }

      const validStages = Object.values(STAGES)
      if (!validStages.includes(toStage) && !STAGES[toStage]) {
        return { status: 400, body: JSON.stringify({ error: `Invalid stage. Valid stages: ${validStages.join(', ')}` }) }
      }

      const pool = await getConnection()
      
      const candidateResult = await pool.request()
        .input('candidateId', sql.Int, parseInt(candidateId))
        .query('SELECT Stage FROM Candidates WHERE Id = @candidateId')

      if (candidateResult.recordset.length === 0) {
        return { status: 404, body: JSON.stringify({ error: 'Candidate not found' }) }
      }

      const currentStageNum = candidateResult.recordset[0].Stage || 1
      const currentStageName = STAGES[currentStageNum] || 'Applied'

      const permission = PERMISSIONS[currentStageName]
      if (!permission || !permission.roles.includes(role)) {
        return { 
          status: 403, 
          body: JSON.stringify({ 
            error: `Role '${role}' cannot move candidate from '${currentStageName}' stage`,
            allowedRoles: permission?.roles || [],
            currentStage: currentStageName
          }) 
        }
      }

      if (!permission.nextStages.includes(toStage)) {
        return { 
          status: 400, 
          body: JSON.stringify({ 
            error: `Cannot move from '${currentStageName}' to stage ${toStage}`,
            allowedNextStages: permission.nextStages.map(s => ({ stage: s, name: STAGES[s] })),
            currentStage: currentStageName
          }) 
        }
      }

      const transaction = pool.transaction()
      await transaction.begin()

      try {
        await transaction.request()
          .input('candidateId', sql.Int, parseInt(candidateId))
          .input('toStage', sql.Int, parseInt(toStage))
          .query(`
            UPDATE Candidates 
            SET Stage = @toStage, Status = @toStage, UpdatedAt = GETUTCDATE()
            WHERE Id = @candidateId
          `)

        await transaction.request()
          .input('candidateId', sql.Int, parseInt(candidateId))
          .input('fromStage', sql.Int, currentStageNum)
          .input('toStage', sql.Int, parseInt(toStage))
          .input('changedBy', sql.NVarChar(100), changedBy || null)
          .input('role', sql.NVarChar(50), role)
          .input('notes', sql.NVarChar(sql.MAX), notes || null)
          .query(`
            INSERT INTO StageHistory (CandidateId, FromStage, ToStage, ChangedBy, Role, Notes)
            VALUES (@candidateId, @fromStage, @toStage, @changedBy, @role, @notes)
          `)

        await transaction.commit()
      } catch (err) {
        await transaction.rollback()
        throw err
      }

      context.log(`Stage transition: Candidate ${candidateId} moved from ${currentStageNum} to ${toStage} by ${role}`)

      return { 
        status: 200, 
        body: JSON.stringify({ 
          message: 'Stage updated successfully',
          candidateId,
          fromStage: currentStageNum,
          fromStageName: currentStageName,
          toStage: parseInt(toStage),
          toStageName: STAGES[toStage],
          changedBy,
          role
        }) 
      }
    } catch (err) {
      context.error('Stage transition error:', err)
      return { status: 500, body: JSON.stringify({ error: err.message }) }
    }
  }
})

app.http('get-stages', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const stages = Object.entries(STAGES).map(([num, name]) => ({
      stage: parseInt(num),
      name,
      permission: PERMISSIONS[name] || null
    }))
    return { body: JSON.stringify({ stages }) }
  }
})

app.http('get-candidate-history', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const candidateId = request.query.get('candidateId')
      if (!candidateId) {
        return { status: 400, body: JSON.stringify({ error: 'candidateId parameter is required' }) }
      }

      const pool = await getConnection()
      const result = await pool.request()
        .input('candidateId', sql.Int, parseInt(candidateId))
        .query(`
          SELECT * FROM StageHistory 
          WHERE CandidateId = @candidateId
          ORDER BY CreatedAt DESC
        `)

      const history = result.recordset.map(h => ({
        ...h,
        fromStageName: STAGES[h.FromStage] || null,
        toStageName: STAGES[h.ToStage] || null
      }))

      return { body: JSON.stringify({ history }) }
    } catch (err) {
      context.error('Get history error:', err)
      return { status: 500, body: JSON.stringify({ error: err.message }) }
    }
  }
})
