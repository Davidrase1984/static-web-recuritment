const { app } = require('@azure/functions')
const { getConnection, sql } = require('../db.js')

app.http('upload-jd', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const multipartData = await request.formData()
      const file = multipartData.get('file')
      
      if (!file) {
        return { status: 400, body: JSON.stringify({ error: 'No file provided' }) }
      }

      const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const fileContent = await file.arrayBuffer()
      const base64Content = Buffer.from(fileContent).toString('base64')
      
      context.log('Upload JD - File:', fileName, 'Size:', fileContent.byteLength, 'bytes')

      return {
        status: 201,
        body: JSON.stringify({ 
          url: `data:${file.type || 'application/octet-stream'};base64,${base64Content}`,
          fileName: fileName,
          contentType: file.type,
          message: 'File uploaded successfully (stored as base64)' 
        })
      }
    } catch (err) {
      context.error('Upload error:', err.message)
      return { status: 500, body: JSON.stringify({ error: 'Upload failed: ' + err.message }) }
    }
  }
})
