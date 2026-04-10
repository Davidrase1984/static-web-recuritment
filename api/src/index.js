const { app } = require('@azure/functions')

app.setup({
    enableHttpStream: true,
});

require('./functions/health')
require('./functions/get-candidates')
require('./functions/candidates-by-requisition')
require('./functions/create-candidate')
require('./functions/update-candidate')
require('./functions/delete-candidate')
require('./functions/get-candidate')

require('./functions/requisitions')
require('./functions/create-requisition')
require('./functions/comments')
require('./functions/create-comment')
require('./functions/upload-jd')
require('./functions/setup-db-v4')
