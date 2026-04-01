const sql = require('mssql')

const config = {
  connectionString: process.env.AZURE_SQL_CONNECTION_STRING
}

let pool = null

async function getConnection() {
  if (pool) return pool
  pool = await sql.connect(config.connectionString)
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
