
const axios = require('axios');

async function apiCallWithRetry(url, options = {}, maxRetries = 3) {
    let lastError = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            // Set timeout for requests
            const config = {
                timeout: 10000,
                ...options
            };
            
            const response = await axios(url, config);
            return response;
        } catch (error) {
            lastError = error;
            
            // Handle different error types
            if (error.response?.status === 429 || error.code === 'ECONNABORTED') {
                const delay = Math.min(Math.pow(2, attempt) * 1000, 8000); // Cap at 8 seconds
                console.log(`Rate limited. Retrying in ${delay}ms... (${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                if (attempt === maxRetries - 1) {
                    console.log('Max retries reached for API call');
                    throw new Error('Max retries reached for API call');
                }
            } else if (error.response?.status >= 500) {
                // Server errors - retry with delay
                const delay = 2000 * (attempt + 1);
                console.log(`Server error. Retrying in ${delay}ms... (${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                if (attempt === maxRetries - 1) {
                    throw error;
                }
            } else {
                // Client errors (4xx) or network errors - don't retry
                throw error;
            }
        }
    }
    
    throw lastError;
}

module.exports = { apiCallWithRetry };
