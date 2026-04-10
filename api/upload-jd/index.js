const { app } = require('@azure/functions')
const { BlobServiceClient } = require('@azure/storage-blob')

app.http('upload-jd', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME
      const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'jobdescriptions'
      
      if (!accountName) {
        return { status: 500, body: JSON.stringify({ error: 'AZURE_STORAGE_ACCOUNT_NAME not configured' }) }
      }

      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
      if (!connectionString) {
        return { status: 500, body: JSON.stringify({ error: 'AZURE_STORAGE_CONNECTION_STRING not configured' }) }
      }

      const multipartData = await request.formData()
      const file = multipartData.get('file')
      
      if (!file) {
        return { status: 400, body: JSON.stringify({ error: 'No file provided' }) }
      }

      const fileName = file.name
      const fileBuffer = await file.arrayBuffer()
      
      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
      const containerClient = blobServiceClient.getContainerClient(containerName)
      await containerClient.createIfNotExists({ access: 'blob' })
      
      const timestamp = Date.now()
      const blobName = `${timestamp}-${fileName}`
      const blobClient = containerClient.getBlobClient(blobName)
      
      await blobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: {
          blobContentType: file.type || 'application/octet-stream'
        }
      })

      const fileUrl = blobClient.url
      context.log('Uploaded JD:', fileName, 'to', fileUrl)

      return {
        status: 201,
        body: JSON.stringify({ 
          url: fileUrl, 
          fileName: fileName,
          message: 'File uploaded successfully' 
        })
      }
    } catch (err) {
      context.error('Upload error:', err)
      return { status: 500, body: JSON.stringify({ error: err.message }) }
    }
  }
})
