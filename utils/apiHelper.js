
const axios = require('axios');

async function apiCallWithRetry(url, options = {}, maxRetries = 3) {
    let lastError = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            // Set timeout for requests
            const config = {
                timeout: 15000, // Increased timeout
                ...options
            };
            
            const response = await axios(url, config);
            return response;
        } catch (error) {
            lastError = error;
            
            // Handle different error types
            if (error.response?.status === 429 || error.code === 'ECONNABORTED' || error.message.includes('Rate limit')) {
                const delay = Math.min(Math.pow(2, attempt) * 1500, 10000); // Increased delays
                console.log(`Rate limited. Retrying in ${delay}ms... (${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                if (attempt === maxRetries - 1) {
                    console.log('Max retries reached for API call');
                    throw new Error('Max retries reached for API call');
                }
            } else if (error.response?.status >= 500 || error.code === 'ENOTFOUND' || error.code === 'ECONNRESET') {
                // Server errors or network issues - retry with delay
                const delay = 3000 * (attempt + 1);
                console.log(`Network/Server error. Retrying in ${delay}ms... (${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                if (attempt === maxRetries - 1) {
                    throw error;
                }
            } else {
                // Client errors (4xx) or other errors - don't retry immediately but still log
                if (attempt < maxRetries - 1) {
                    console.log(`API error ${error.response?.status || error.code}. Retrying... (${attempt + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    throw error;
                }
            }
        }
    }
    
    throw lastError;
}

module.exports = { apiCallWithRetry };
