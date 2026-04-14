class BaseScraper {
  constructor(platform, config) {
    this.platform = platform;
    this.config = config;
    this.proxy = null;
    this.userAgents = this.loadUserAgents();
    this.page = null;
    this.browser = null;
  }

  loadUserAgents() {
    return [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0'
    ];
  }

  async initialize(page) {
    this.page = page;
    await this.setupPage();
  }

  async setupPage() {
    if (!this.page) return;

    // Randomize user agent
    const randomUserAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    await this.page.setUserAgent(randomUserAgent);

    // Randomize viewport
    await this.page.setViewport({
      width: 1920 + Math.floor(Math.random() * 200),
      height: 1080 + Math.floor(Math.random() * 200),
      deviceScaleFactor: 1,
    });

    // Set additional headers to appear more human
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    });

    // Add stealth techniques
    await this.page.evaluateOnNewDocument(() => {
      // Hide webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Override plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          {
            0: {
              type: "application/x-google-chrome-pdf",
              suffixes: "pdf",
              description: "Portable Document Format",
              enabledPlugin: Plugin
            },
            description: "Portable Document Format",
            filename: "internal-pdf-viewer",
            length: 1,
            name: "Chrome PDF Plugin"
          }
        ],
      });

      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
    });
  }

  async execute(query) {
    throw new Error('execute method must be implemented by subclass');
  }

  async handleRateLimit() {
    // Implement exponential backoff
    const delay = this.calculateBackoff();
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  calculateBackoff() {
    const attempts = this.retryAttempts || 0;
    this.retryAttempts = attempts + 1;
    return Math.min(1000 * Math.pow(2, attempts), 60000); // Max 1 minute
  }

  async randomDelay(min = 1000, max = 3000) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async simulateHumanBehavior() {
    // Random mouse movements
    await this.page.mouse.move(
      Math.random() * 1000,
      Math.random() * 1000
    );

    // Random scroll
    await this.page.evaluate(() => {
      window.scrollBy(0, Math.random() * 500);
    });

    // Random delay
    await this.randomDelay();
  }
}

module.exports = BaseScraper;