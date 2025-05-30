
const rateLimitHandler = {
  delays: new Map(),
  
  async withRetry(fn, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        const is429 = error.response?.status === 429 || 
                     error.toString().includes('429') || 
                     error.toString().includes('Rate limited');
        
        if (is429 && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        if (is429) {
          console.log('Max retries reached for rate limited request');
          return null; // Return null instead of throwing for rate limits
        }
        
        throw error; // Re-throw non-rate-limit errors
      }
    }
  },
  
  async downloadWithRetry(url, filepath, axios, fs) {
    return this.withRetry(async () => {
      const response = await axios.get(url, { 
        responseType: 'arraybuffer', 
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      fs.writeFileSync(filepath, Buffer.from(response.data));
      return response;
    });
  }
};

module.exports = rateLimitHandler;
