const { app } = require('@azure/functions')
const { BlobServiceClient } = require('@azure/storage-blob')

app.http('upload-jd', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const contentType = request.headers.get('content-type') || ''
      
      if (!contentType.includes('multipart/form-data')) {
        return { status: 400, body: JSON.stringify({ error: 'Expected multipart/form-data' }) }
      }

      const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME
      const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'jobdescriptions'
      
      if (!accountName) {
        return { status: 500, body: JSON.stringify({ error: 'AZURE_STORAGE_ACCOUNT_NAME not configured' }) }
      }

      const body = await request.text()
      const boundary = contentType.split('boundary=')[1]
      if (!boundary) {
        return { status: 400, body: JSON.stringify({ error: 'Missing boundary' }) }
      }

      const parts = body.split('--' + boundary).filter(p => p.trim() && !p.includes('--'))
      
      let fileName = ''
      let fileData = null
      
      for (const part of parts) {
        const headerEnd = part.indexOf('\r\n\r\n')
        if (headerEnd === -1) continue
        
        const headers = part.substring(0, headerEnd)
        const contentDisposition = headers.match(/Content-Disposition: form-data; name="file"; filename="([^"]+)"/)
        
        if (contentDisposition) {
          fileName = contentDisposition[1]
          fileData = part.substring(headerEnd + 4).replace(/\r\n$/, '')
          break
        }
      }

      if (!fileName || !fileData) {
        return { status: 400, body: JSON.stringify({ error: 'No file provided' }) }
      }

      const blobServiceClient = BlobServiceClient.fromConnectionString(
        process.env.AZURE_STORAGE_CONNECTION_STRING
      )
      
      const containerClient = blobServiceClient.getContainerClient(containerName)
      await containerClient.createIfNotExists({ access: 'blob' })
      
      const timestamp = Date.now()
      const blobName = `${timestamp}-${fileName}`
      const blobClient = containerClient.getBlobClient(blobName)
      
      const buffer = Buffer.from(fileData, 'base64')
      await blobClient.uploadData(buffer)

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
