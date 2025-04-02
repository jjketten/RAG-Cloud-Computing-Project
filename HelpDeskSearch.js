const { app } = require('@azure/functions');
const axios = require('axios');

const AZURE_SEARCH_URL = 'https://ithelpdesk.search.windows.net';
const AZURE_INDEX = 'azureblob-index';
const AZURE_API_KEY = process.env["AZURE_API_KEY"]; 

app.http('HelpDeskSearch', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const issue = request.query.get('issue');

    if (!issue) {
      return {
        status: 400,
        body: 'Missing required query parameter: issue'
      };
    }
    const searchUrl =
      `${AZURE_SEARCH_URL}/indexes/${AZURE_INDEX}/docs/search` +
      `?api-version=2021-04-30-Preview`;

    try {
      const response = await axios.post(
        searchUrl,
        { search: issue, top: 3 },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': AZURE_API_KEY,
          },
        }
      );

      const results = response.data.value;

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results }),
      };
    } catch (err) {
      context.error(err);
      return {
        status: 500,
        body: 'Azure Search Error: ' + err.message,
      };
    }
  },
});
