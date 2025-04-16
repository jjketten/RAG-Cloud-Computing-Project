const { app } = require('@azure/functions');
const axios = require('axios');

const AZURE_SEARCH_URL = 'https://rag-helpdesk-test.search.windows.net/';
const AZURE_INDEX = 'test2'; 
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
        body: 'In the url add ?issue=something'
      };
    }

    const searchUrl =
      `${AZURE_SEARCH_URL}/indexes/${AZURE_INDEX}/docs/search?api-version=2021-04-30-Preview`;

    try {
      const searchResponse = await axios.post(
        searchUrl,
        { search: issue, top: 3 },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': AZURE_API_KEY,
          }
        }
      );

      const results = searchResponse.data.value;

      
      const contentBlocks = results
        .filter(r => typeof r.body === "string" && typeof r.answer === "string")
        .map(r => `Subject: ${r.subject || 'No subject'}\nIssue: ${r.body}\nResponse: ${r.answer}`);

      const contextText = contentBlocks.join('\n\n');

      if (!contextText.trim()) {
        return {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            original_query: issue,
            retrieved_tickets: [],
            ai_response: "No good tickets that could be used were found."
          })
        };
      }

      
      const prompt = `The user is reporting this issue: "${issue}". Use the following helpdesk tickets to assist them & provide a user-friendly formatted response:\n\n${contextText}`;

      const deepSeekResponse = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are an IT helpdesk assistant. Use only the provided ticket data to help the user."
            },
            {
              role: "user",
              content: prompt
            }
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
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin' : 'https://*.github.io' },
        body: JSON.stringify({
          original_query: issue,
          retrieved_tickets: results,
          ai_response: answer
        })
      };

    } catch (err) {
      context.error("Something went wrong while fetchin your response:", err.message);
      return {
        status: 500,
        body: 'Error: ' + err.message
      };
    }
  }
});
