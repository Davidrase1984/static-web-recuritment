const sql = require('mssql')

let pool = null

async function getConnection() {
  if (pool) return pool

  const server = process.env.AZURE_SQL_SERVER || 'azuresqlfcec.database.windows.net'
  const database = process.env.AZURE_SQL_DATABASE || 'Recuritmentdb'
  const user = process.env.AZURE_SQL_USER || 'fcec'
  const password = process.env.AZURE_SQL_PASSWORD || ''

  if (!password) {
    throw new Error('AZURE_SQL_PASSWORD environment variable is not set')
  }

  pool = await sql.connect({
    server: server,
    database: database,
    user: user,
    password: password,
    options: {
      encrypt: true,
      trustServerCertificate: false
    }
  })

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
