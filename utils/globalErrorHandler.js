
const logger = require('./log.js');

class GlobalErrorHandler {
  constructor() {
    this.setupHandlers();
  }

  setupHandlers() {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.handleError('UncaughtException', error);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.handleError('UnhandledRejection', reason, promise);
    });

    // Handle warnings
    process.on('warning', (warning) => {
      this.handleWarning(warning);
    });
  }

  handleError(type, error, promise = null) {
    const ignoredErrors = [
      'Rate limited',
      'Request failed with status code 429',
      'Jimp.read is not a function',
      'jimp.read is not a function',
      'not part of the conversation',
      'Max retries reached for API call',
      'Background download error',
      'Avatar processing error',
      'Got error 1545012',
      'WARN sendMessage',
      'ENOENT: no such file or directory',
      'ECONNRESET',
      'ETIMEDOUT',
      'socket hang up',
      'ENOTFOUND'
    ];

    const errorStr = error ? error.toString() : '';
    const shouldIgnore = ignoredErrors.some(ignored => 
      errorStr.includes(ignored)
    );

    if (!shouldIgnore) {
      if (type === 'UnhandledRejection' && promise) {
        console.error(`${type} at:`, promise, 'reason:', error);
      } else {
        console.error(`${type}:`, error);
      }
    }

    // Don't exit the process for these errors
  }

  handleWarning(warning) {
    const ignoredWarnings = [
      'ExperimentalWarning',
      'DeprecationWarning'
    ];

    const shouldIgnore = ignoredWarnings.some(ignored => 
      warning.name && warning.name.includes(ignored)
    );

    if (!shouldIgnore) {
      console.warn('Process Warning:', warning);
    }
  }

  // Wrapper for API calls with automatic error handling
  async safeApiCall(apiFunction, fallbackValue = null) {
    try {
      return await apiFunction();
    } catch (error) {
      this.handleError('SafeApiCall', error);
      return fallbackValue;
    }
  }

  // Rate limited API call wrapper
  async rateLimitedApiCall(apiFunction, retries = 3, baseDelay = 2000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await apiFunction();
      } catch (error) {
        const is429 = error.response?.status === 429 || 
                     error.toString().includes('429') || 
                     error.toString().includes('Rate limited');
        
        if (is429 && attempt < retries) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        if (is429) {
          console.log('Max retries reached for rate limited request');
          return null;
        }
        
        throw error;
      }
    }
  }
}

module.exports = new GlobalErrorHandler();
