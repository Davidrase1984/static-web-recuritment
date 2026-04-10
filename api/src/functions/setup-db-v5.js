const { app } = require('@azure/functions')
const { getConnection, sql } = require('../db.js')

app.http('setup-db-v5', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const pool = await getConnection()
      const results = []

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Candidates') AND name = 'Stage')
        BEGIN
          ALTER TABLE Candidates ADD Stage INT DEFAULT 1
        END
      `)
      results.push('Stage column added to Candidates table')

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'StageHistory')
        BEGIN
          CREATE TABLE StageHistory (
            Id INT IDENTITY(1,1) PRIMARY KEY,
            CandidateId INT NOT NULL,
            FromStage INT,
            ToStage INT NOT NULL,
            ChangedBy NVARCHAR(100),
            Role NVARCHAR(50),
            Notes NVARCHAR(MAX),
            CreatedAt DATETIME2 DEFAULT GETUTCDATE()
          )
        END
      `)
      results.push('StageHistory table created')

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_StageHistory_Candidates')
        BEGIN
          ALTER TABLE StageHistory ADD CONSTRAINT FK_StageHistory_Candidates 
          FOREIGN KEY (CandidateId) REFERENCES Candidates(Id) ON DELETE CASCADE
        END
      `)
      results.push('StageHistory FK added')

      context.log('Database v5 setup complete:', results.join(', '))
      return { body: JSON.stringify({ message: 'Database v5 setup complete', details: results }) }
    } catch (err) {
      context.error('Setup v5 error:', err)
      return { status: 500, body: JSON.stringify({ error: err.message }) }
    }
  }
})
