
const rateLimitHandler = {
  delays: new Map(),
  requestCounts: new Map(),
  
  // Rate limiting with request tracking
  async withRateLimit(key, fn, minDelay = 1000) {
    const now = Date.now();
    const lastCall = this.delays.get(key) || 0;
    const timeSinceLastCall = now - lastCall;
    
    if (timeSinceLastCall < minDelay) {
      const waitTime = minDelay - timeSinceLastCall;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.delays.set(key, Date.now());
    return await fn();
  },
  
  async withRetry(fn, maxRetries = 5, baseDelay = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        const is429 = error.response?.status === 429 || 
                     error.toString().includes('429') || 
                     error.toString().includes('Rate limited') ||
                     error.toString().includes('Too Many Requests');
        
        const isNetworkError = error.code === 'ECONNRESET' ||
                              error.code === 'ETIMEDOUT' ||
                              error.code === 'ENOTFOUND' ||
                              error.toString().includes('socket hang up');
        
        if ((is429 || isNetworkError) && attempt < maxRetries) {
          const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 30000); // Max 30s delay
          console.log(`Request failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        if (is429 || isNetworkError) {
          console.log('Max retries reached for failed request');
          return null; // Return null instead of throwing
        }
        
        throw error; // Re-throw other errors
      }
    }
  },
  
  async downloadWithRetry(url, filepath, axios, fs) {
    return this.withRetry(async () => {
      return this.withRateLimit(`download_${url}`, async () => {
        const response = await axios.get(url, { 
          responseType: 'arraybuffer', 
          timeout: 20000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9'
          },
          maxRedirects: 5
        });
        
        if (response.data && response.data.length > 0) {
          fs.writeFileSync(filepath, Buffer.from(response.data));
          return response;
        } else {
          throw new Error('Empty response data');
        }
      });
    }, 3, 3000); // 3 retries with 3 second base delay
  },
  
  // API call wrapper with built-in rate limiting
  async apiCall(apiFunction, key = 'default') {
    return this.withRateLimit(key, () => this.withRetry(apiFunction));
  }
};

module.exports = rateLimitHandler;
