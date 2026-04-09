const { app } = require('@azure/functions')
const { getConnection, sql } = require('../db.js')

app.http('setup-db-v3', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const pool = await getConnection()

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Requisitions') AND name = 'JobRequisitionNumber')
        BEGIN
          ALTER TABLE Requisitions ADD JobRequisitionNumber NVARCHAR(50) NULL
        END
      `)
      context.log('JobRequisitionNumber column ready')

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Requisitions') AND name = 'HiringManager')
        BEGIN
          ALTER TABLE Requisitions ADD HiringManager NVARCHAR(100) NULL
        END
      `)
      context.log('HiringManager column ready')

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Requisitions') AND name = 'JDIntiationDate')
        BEGIN
          ALTER TABLE Requisitions ADD JDIntiationDate DATETIME2 NULL
        END
      `)
      context.log('JDIntiationDate column ready')

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Requisitions') AND name = 'JobDescription')
        BEGIN
          ALTER TABLE Requisitions ADD JobDescription NVARCHAR(MAX) NULL
        END
      `)
      context.log('JobDescription column ready')

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Requisitions') AND name = 'HiringType')
        BEGIN
          ALTER TABLE Requisitions ADD HiringType NVARCHAR(50) NULL
        END
      `)
      context.log('HiringType column ready')

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Requisitions') AND name = 'FY')
        BEGIN
          ALTER TABLE Requisitions ADD FY NVARCHAR(10) NULL
        END
      `)
      context.log('FY column ready')

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Requisitions') AND name = 'Period')
        BEGIN
          ALTER TABLE Requisitions ADD Period NVARCHAR(10) NULL
        END
      `)
      context.log('Period column ready')

      return { body: JSON.stringify({ message: 'Database v3 setup complete. New Requisitions columns added.' }) }
    } catch (err) {
      context.error('Setup v3 error:', err)
      return { status: 500, body: JSON.stringify({ error: err.message }) }
    }
  }
})
