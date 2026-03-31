const { app } = require('@azure/functions');

app.http('hello', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`HTTP function processed request: ${request.url}`);

        const name = (request.query.get('name') || 
                     (await request.text()) || 
                     'World');

        return { body: `Hello, ${name}!` };
    }
});