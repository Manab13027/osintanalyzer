class RateLimiter {
  constructor() {
    this.requestCounts = new Map();
    this.blockedPlatforms = new Map();
    this.retryDelays = new Map();
    this.maxRequestsPerMinute = {
      'linkedin': 30,
      'twitter': 60,
      'instagram': 30,
      'facebook': 20,
      'tiktok': 30,
      'youtube': 60,
      'reddit': 60,
      'pinterest': 30,
      'discord': 30,
      'twitch': 30,
      'threads': 30,
      'snapchat': 30,
      'github': 60,
      'medium': 30,
      'quora': 30,
      'tumblr': 30,
      'flickr': 30,
      'rumble': 30,
      'clubhouse': 30,
      'telegram': 30,
      'signal': 30,
      'viber': 30,
      'spotify': 30,
      'patreon': 30,
      'weibo': 30,
      'bilibili': 30,
      'zhihu': 30,
      'douyin': 30,
      'kuaishou': 30,
      'xiaohongshu': 30,
      'baidu-tieba': 30,
      'wechat': 30,
      'qq': 30,
      'youku': 30,
      'iqiyi': 30,
      'tencent-video': 30,
      'vkontakte': 30,
      'ok-ru': 30,
      'yandex-q': 30,
      'yappy': 30,
      'sharechat': 30,
      'moj': 30,
      'josh': 30,
      'koo': 30,
      'chingari': 30,
      'roposo': 30,
      'mitron': 30,
      'public-app': 30,
      'line': 30,
      'mixi': 30,
      'ameba': 30,
      'niconico': 30,
      'snack-video': 30,
      'bolo-live': 30,
      'likee': 30,
      'helo': 30
    };
  }

  async checkRateLimit(platform) {
    const now = Date.now();
    const count = this.requestCounts.get(platform) || { count: 0, resetTime: now + 60000 };
    
    if (now > count.resetTime) {
      // Reset counter
      this.requestCounts.set(platform, { count: 1, resetTime: now + 60000 });
      return true;
    }
    
    const maxRequests = this.maxRequestsPerMinute[platform.toLowerCase()] || 10;
    
    if (count.count >= maxRequests) {
      // Rate limited
      await this.handleRateLimit(platform);
      return false;
    }
    
    // Increment counter
    count.count++;
    this.requestCounts.set(platform, count);
    return true;
  }

  async handleRateLimit(platform) {
    // Implement exponential backoff
    const delay = this.calculateBackoff(platform);
    console.log(`Rate limited for ${platform}. Waiting ${delay}ms before retry.`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  calculateBackoff(platform) {
    const attempts = this.retryDelays.get(platform) || 0;
    const delay = Math.min(1000 * Math.pow(2, attempts), 60000); // Max 1 minute
    this.retryDelays.set(platform, attempts + 1);
    return delay;
  }

  async handleBlock(platform) {
    // More sophisticated handling for blocked platforms
    const blockedUntil = Date.now() + 3600000; // 1 hour from now
    this.blockedPlatforms.set(platform, blockedUntil);
    
    console.log(`Platform ${platform} is blocked until ${new Date(blockedUntil).toISOString()}`);
    
    // Try alternative approaches
    return this.tryAlternativeApproach(platform);
  }

  async tryAlternativeApproach(platform) {
    // Try different methods:
    // 1. Use mobile version
    // 2. Use API endpoints
    // 3. Use third-party services
    // 4. Use different authentication method
    
    console.log(`Trying alternative approach for ${platform}`);
    
    // Implementation would depend on the specific platform
    // For now, we'll just return a generic approach
    return {
      useMobile: true,
      useAPI: false,
      useThirdParty: false
    };
  }

  isPlatformBlocked(platform) {
    const blockedUntil = this.blockedPlatforms.get(platform);
    if (!blockedUntil) return false;
    
    if (Date.now() > blockedUntil) {
      // Block expired
      this.blockedPlatforms.delete(platform);
      return false;
    }
    
    return true;
  }
}

module.exports = RateLimiter;