const axios = require('axios');
const config = require('config');

class RobotsBypass {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.cache = new Map();
  }

  async bypassRobots(url) {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.origin;
    
    // Check cache first
    if (this.cache.has(domain)) {
      const cachedData = this.cache.get(domain);
      if (Date.now() < cachedData.expiry) {
        return cachedData.allowedPaths.has(parsedUrl.pathname) ? url : this.findAlternativeEndpoint(parsedUrl);
      }
    }
    
    try {
      const robotsUrl = `${domain}/robots.txt`;
      const robotsTxt = await this.fetchRobotsTxt(robotsUrl);
      const allowedPaths = this.parseRobotsTxt(robotsTxt);
      
      // Cache the result for 1 hour
      this.cache.set(domain, {
        allowedPaths,
        expiry: Date.now() + 3600000
      });
      
      if (allowedPaths.has(parsedUrl.pathname)) {
        return url;
      }
      
      return this.findAlternativeEndpoint(parsedUrl);
    } catch (error) {
      console.error(`Error checking robots.txt for ${domain}:`, error.message);
      return url; // Proceed with caution if we can't check robots.txt
    }
  }

  async fetchRobotsTxt(url) {
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': this.userAgent
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch robots.txt: ${error.message}`);
    }
  }

  parseRobotsTxt(robotsTxt) {
    const allowedPaths = new Set();
    const disallowedPaths = new Set();
    let currentUserAgent = null;
    
    const lines = robotsTxt.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }
      
      // Check for User-agent directive
      if (trimmedLine.toLowerCase().startsWith('user-agent:')) {
        const userAgent = trimmedLine.substring('user-agent:'.length).trim();
        
        // Check if this applies to our user agent or is a wildcard
        if (userAgent === '*' || userAgent.includes(this.userAgent.split(' ')[0])) {
          currentUserAgent = userAgent;
        } else {
          currentUserAgent = null;
        }
        continue;
      }
      
      // Only process rules for our user agent
      if (!currentUserAgent) {
        continue;
      }
      
      // Process Allow directives
      if (trimmedLine.toLowerCase().startsWith('allow:')) {
        const path = trimmedLine.substring('allow:'.length).trim();
        if (path) {
          allowedPaths.add(path);
        }
        continue;
      }
      
      // Process Disallow directives
      if (trimmedLine.toLowerCase().startsWith('disallow:')) {
        const path = trimmedLine.substring('disallow:'.length).trim();
        if (path) {
          disallowedPaths.add(path);
        }
        continue;
      }
      
      // Process Crawl-delay
      if (trimmedLine.toLowerCase().startsWith('crawl-delay:')) {
        const delay = parseFloat(trimmedLine.substring('crawl-delay:'.length).trim());
        if (!isNaN(delay)) {
          // Store crawl delay for this domain
          // In a real implementation, you would use this to throttle requests
        }
      }
    }
    
    // If no specific rules for our user agent, assume everything is allowed
    if (allowedPaths.size === 0 && disallowedPaths.size === 0) {
      allowedPaths.add('/');
    }
    
    return allowedPaths;
  }

  findAlternativeEndpoint(parsedUrl) {
    const domain = parsedUrl.origin;
    const path = parsedUrl.pathname;
    
    // Try common alternatives
    const alternatives = [
      `${domain}/m${path}`, // Mobile version
      `${domain}/api${path}`, // API endpoint
      `${domain}/v1${path}`, // API v1
      `${domain}/mobile${path}`, // Mobile version
      `${domain}/amp${path}`, // AMP version
    ];
    
    // Return the first alternative (in a real implementation, you would test these)
    return alternatives[0];
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = RobotsBypass;