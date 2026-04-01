const sql = require('mssql')

const connectionString = process.env.AZURE_SQL_CONNECTION_STRING

let pool = null

async function getConnection() {
  if (!connectionString) {
    throw new Error('AZURE_SQL_CONNECTION_STRING environment variable is not set')
  }
  if (pool) return pool

  const connStr = connectionString.replace(
    'Authentication="Active Directory Default"',
    'Authentication=Active Directory Managed Identity'
  )

  pool = await sql.connect(connStr)
  pool.on('error', () => { pool = null })
  return pool
}

async function closeConnection() {
  if (pool) {
    await pool.close()
    pool = null
  }
}

module.exports = { sql, getConnection, closeConnection }
