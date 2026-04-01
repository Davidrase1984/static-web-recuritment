const { app } = require('@azure/functions')
const { getConnection, sql } = require('./db.cjs')

app.http('setup-db', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const pool = await getConnection()
      context.log('Connected to Azure SQL')

      const createTableSQL = `
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Candidates')
        BEGIN
          CREATE TABLE Candidates (
            Id          INT IDENTITY(1,1) PRIMARY KEY,
            FirstName   NVARCHAR(100) NOT NULL,
            LastName    NVARCHAR(100) NOT NULL,
            Email       NVARCHAR(255) NOT NULL UNIQUE,
            Phone       NVARCHAR(20),
            Position    NVARCHAR(100),
            Status      NVARCHAR(50) DEFAULT 'Applied',
            Notes       NVARCHAR(MAX),
            CreatedAt   DATETIME2 DEFAULT GETUTCDATE(),
            UpdatedAt   DATETIME2 DEFAULT GETUTCDATE()
          )
        END
      `

      await pool.request().query(createTableSQL)
      context.log('Candidates table created or already exists')

      return { body: JSON.stringify({ message: 'Database setup complete. Candidates table ready.' }) }
    } catch (err) {
      context.error('Setup error:', err)
      return {
        status: 500,
        body: JSON.stringify({ error: err.message })
      }
    }
  }
})
