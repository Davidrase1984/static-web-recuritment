const sql = require('mssql')
const { DefaultAzureCredential } = require('@azure/identity')

const connectionString = process.env.AZURE_SQL_CONNECTION_STRING

let pool = null

async function getConnection() {
  if (!connectionString) {
    throw new Error('AZURE_SQL_CONNECTION_STRING environment variable is not set')
  }
  if (pool) return pool

  const credential = new DefaultAzureCredential()
  const tokenResponse = await credential.getToken('https://database.windows.net/')

  pool = await sql.connect({
    connectionString: connectionString,
    authentication: {
      type: 'azure-active-directory-access-token',
      options: {
        token: tokenResponse.token
      }
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
