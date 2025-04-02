const { app } = require('@azure/functions');
const axios = require('axios');

const AZURE_SEARCH_URL = 'https://ithelpdesk.search.windows.net';
const AZURE_INDEX = 'azureblob-index';
const AZURE_API_KEY = process.env["AZURE_API_KEY"]; 
const DEEPSEEK_API_KEY = process.env["DEEPSEEK_API_KEY"];

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

      const rawResults = response.data.value;
      const results = rawResults.map(r => {
        try {
          return JSON.parse(r.content); 
        } catch (e) {
          return {}; 
        }
      });

      const contextText = results.map(r =>
        `Issue: ${r.body}\nResolution: ${r.answer}`
      ).join('\n\n');

      const deepSeekResponse = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "You are an IT helpdesk assistant. Respond based on the provided information." },
            { role: "user", content: `The user issue is: ${issue}\n\nHere are relevant past tickets:\n${contextText}` }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
          }
        }
      );

      const answer = deepSeekResponse.data.choices[0].message.content;

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_query: issue,
          retrieved_tickets: results,
          ai_response: answer
          }),
      };
    } catch (err) {
      context.error(err);
      return {
        status: 500,
        body: 'Search Error: ' + err.message,
      };
    }
  },
});
