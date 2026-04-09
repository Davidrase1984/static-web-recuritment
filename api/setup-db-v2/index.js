const { app } = require('@azure/functions')
const { getConnection, sql } = require('../db.js')

app.http('setup-db-v2', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const pool = await getConnection()

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Requisitions')
        BEGIN
          CREATE TABLE Requisitions (
            Id                INT IDENTITY(1,1) PRIMARY KEY,
            Title             NVARCHAR(200) NOT NULL,
            Department        NVARCHAR(100),
            Description       NVARCHAR(MAX),
            HiringManagerName NVARCHAR(100),
            Status            NVARCHAR(50) DEFAULT 'Open',
            CreatedAt         DATETIME2 DEFAULT GETUTCDATE(),
            UpdatedAt         DATETIME2 DEFAULT GETUTCDATE()
          )
        END
      `)
      context.log('Requisitions table ready')

      await pool.request().query(`
        IF NOT EXISTS (
          SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Candidates') AND name = 'RequisitionId'
        )
        BEGIN
          ALTER TABLE Candidates ADD RequisitionId INT NULL
          ALTER TABLE Candidates ADD CONSTRAINT FK_Candidates_Requisitions
            FOREIGN KEY (RequisitionId) REFERENCES Requisitions(Id)
        END
      `)
      context.log('Candidates.RequisitionId column ready')

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Comments')
        BEGIN
          CREATE TABLE Comments (
            Id             INT IDENTITY(1,1) PRIMARY KEY,
            CandidateId    INT NOT NULL,
            RequisitionId  INT NULL,
            AuthorName     NVARCHAR(100),
            Role           NVARCHAR(50) NOT NULL,
            CommentText    NVARCHAR(MAX) NOT NULL,
            Rating         INT NULL,
            CreatedAt      DATETIME2 DEFAULT GETUTCDATE(),
            CONSTRAINT FK_Comments_Candidates FOREIGN KEY (CandidateId) REFERENCES Candidates(Id) ON DELETE CASCADE,
            CONSTRAINT FK_Comments_Requisitions FOREIGN KEY (RequisitionId) REFERENCES Requisitions(Id)
          )
        END
      `)
      context.log('Comments table ready')

      return { body: JSON.stringify({ message: 'Database v2 setup complete. Requisitions, Comments tables ready.' }) }
    } catch (err) {
      context.error('Setup v2 error:', err)
      return { status: 500, body: JSON.stringify({ error: err.message }) }
    }
  }
})
