const getHelpDeskResponse = async (issue) => {
    if (!issue) {
        throw new Error('An issue must be provided.');
    }

    try {
        // uncomment this in dev
        //const response = await fetch(`/api/HelpDeskSearch?issue=${encodeURIComponent(issue)}`);
        const response = await fetch(`https://raghelpdeskbackend.azurewebsites.net/api/HelpDeskSearch?issue=${encodeURIComponent(issue)}`);

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        return data.ai_response || 'No response available.';
    } catch (error) {
        console.error('Error fetching AI response:', error);
        throw error;
    }
};

export default {
    getHelpDeskResponse,
};