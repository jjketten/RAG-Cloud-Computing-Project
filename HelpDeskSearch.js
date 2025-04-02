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

      // Step 1: Filter and truncate content
      const contentBlocks = results
        .map(r => r.content)
        .filter(c => typeof c === "string" && c.trim().length > 0)
        .map(c => c.length > 3000 ? c.slice(0, 3000) + '…' : c); // Optional: limit each to 3k chars

      const contextText = contentBlocks.join('\n\n');

      if (!contextText.trim()) {
        return {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            original_query: issue,
            retrieved_tickets: [],
            ai_response: "No usable ticket content was found."
          })
        };
      }

      // Step 2: Construct full DeepSeek prompt
      const userPrompt = `The user is reporting the following issue: "${issue}". Use the helpdesk ticket content below to assist them:\n\n${contextText}`;

      // Optional: truncate if total string exceeds 10,000 characters
      const finalPrompt = userPrompt.length > 9000
        ? userPrompt.slice(0, 9000) + '\n\n...(truncated)'
        : userPrompt;

      // Step 3: Send to DeepSeek
      const deepSeekResponse = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are an IT helpdesk assistant. Use the provided helpdesk ticket content to assist the user."
            },
            {
              role: "user",
              content: finalPrompt
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_query: issue,
          retrieved_tickets: results,
          ai_response: answer
        })
      };

    } catch (err) {
      context.error("❌ Error with DeepSeek request:", err.message);
      return {
        status: 500,
        body: 'Error: ' + err.message
      };
    }
  }
});
