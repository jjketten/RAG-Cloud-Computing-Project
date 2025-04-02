const axios = require("axios");

const AZURE_SEARCH_URL = "https://ithelpdesk.search.windows.net";
const AZURE_INDEX = "azureblob-index";
const AZURE_API_KEY = process.env["AZURE_API_KEY"];

module.exports = async function (context, req) {
    const userQuery = req.query.issue || (req.body && req.body.issue) || "vpn issue";

    const searchUrl =
        `${AZURE_SEARCH_URL}/indexes/${AZURE_INDEX}/docs/search` +
        `?api-version=2021-04-30-Preview`;

    try {
        const response = await axios.post(
            searchUrl,
            { search: userQuery, top: 3 },
            {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": AZURE_API_KEY,
                },
            }
        );

        const results = response.data.value;
        context.res = {
            status: 200,
            body: { results },
        };
    } catch (error) {
        context.log(error);
        context.res = {
            status: 500,
            body: "Azure Search Error: " + error.message,
        };
    }
};
