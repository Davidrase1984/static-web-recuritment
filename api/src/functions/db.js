const sql = require('mssql')

const connectionString = process.env.AZURE_SQL_CONNECTION_STRING

let pool = null

async function getConnection() {
  if (!connectionString) {
    throw new Error('AZURE_SQL_CONNECTION_STRING environment variable is not set')
  }
  if (pool) return pool

  // Replace Active Directory Default with Managed Identity for production
  const connStr = connectionString.replace(
    'Authentication="Active Directory Default"',
    'Authentication=Active Directory Managed Identity'
  )

  try {
    pool = await sql.connect(connStr)
  } catch (err) {
    // Fallback: try without authentication (for local dev with az login)
    pool = await sql.connect(connectionString)
  }

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
