const { app } = require('@azure/functions')
const { BlobServiceClient } = require('@azure/storage-blob')
const { requireRole } = require('../auth.js')

app.http('upload-jd', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const auth = requireRole(request, 'hr-admin')
    if (!auth.authorized) return auth.forbiddenResponse

    try {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
      const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'jobdescriptions'
      
      context.log('Upload JD - Connection string configured:', !!connectionString)
      context.log('Upload JD - Container:', containerName)
      
      if (!connectionString) {
        return { status: 500, body: JSON.stringify({ error: 'AZURE_STORAGE_CONNECTION_STRING not configured' }) }
      }

      const multipartData = await request.formData()
      const file = multipartData.get('file')
      
      if (!file) {
        return { status: 400, body: JSON.stringify({ error: 'No file provided' }) }
      }

      const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const fileBuffer = await file.arrayBuffer()
      
      context.log('Upload JD - File:', fileName, 'Size:', fileBuffer.byteLength, 'bytes')
      
      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
      const containerClient = blobServiceClient.getContainerClient(containerName)
      
      const timestamp = Date.now()
      const blobName = `${timestamp}-${fileName}`
      const blockBlobClient = containerClient.getBlockBlobClient(blobName)
      
      context.log('Upload JD - Uploading to:', blockBlobClient.url)
      
      await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: {
          blobContentType: file.type || 'application/octet-stream'
        }
      })

      const fileUrl = blockBlobClient.url
      context.log('Upload JD - Success:', fileUrl)

      return {
        status: 201,
        body: JSON.stringify({ 
          url: fileUrl, 
          fileName: fileName,
          message: 'File uploaded successfully' 
        })
      }
    } catch (err) {
      context.error('Upload error:', err.message)
      context.error('Upload error details:', err.stack)
      return { status: 500, body: JSON.stringify({ error: 'Upload failed: ' + err.message }) }
    }
  }
})
