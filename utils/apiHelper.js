
const axios = require('axios');

async function apiCallWithRetry(url, options = {}, maxRetries = 5) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await axios(url, options);
            return response;
        } catch (error) {
            if (error.response?.status === 429) {
                const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                console.log(`Rate limited. Retrying in ${delay}ms... (${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                if (attempt === maxRetries - 1) {
                    throw new Error('Max retries reached for API call');
                }
            } else {
                throw error;
            }
        }
    }
}

module.exports = { apiCallWithRetry };
