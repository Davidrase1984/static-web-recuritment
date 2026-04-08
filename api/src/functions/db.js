const sql = require('mssql')

let pool = null

async function getConnection() {
  if (pool) {
    try {
      await pool.close()
    } catch (e) {}
    pool = null
  }

  const password = process.env.AZURE_SQL_PASSWORD
  if (!password) {
    throw new Error('AZURE_SQL_PASSWORD environment variable is not set')
  }

  pool = await sql.connect({
    server: 'azuresqlfcec.database.windows.net',
    database: 'Recuritmentdb',
    user: process.env.AZURE_SQL_USER || 'fcec',
    password: password,
    options: {
      encrypt: true,
      trustServerCertificate: true
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