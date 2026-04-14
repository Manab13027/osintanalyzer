const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const config = require('config');
const ProxyManager = require('./proxy-manager');

puppeteer.use(StealthPlugin());

class BrowserManager {
  constructor() {
    this.browsers = [];
    this.currentBrowserIndex = 0;
    this.maxBrowsers = 5;
    this.proxyManager = new ProxyManager();
  }

  async initialize() {
    await this.proxyManager.initialize();
    
    // Pre-create some browsers
    for (let i = 0; i < 2; i++) {
      await this.createNewBrowser();
    }
  }

  async createNewBrowser() {
    const proxy = await this.proxyManager.rotateProxy();
    
    const launchOptions = {
      headless: config.get('scraping.headless') !== false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-default-apps',
        '--disable-translate',
        '--disable-sync',
        '--hide-scrollbars',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-first-run',
        '--safebrowsing-disable-auto-update',
      ],
      ignoreDefaultArgs: ['--enable-automation'],
    };

    // Add proxy if available
    if (proxy) {
      launchOptions.args.push(`--proxy-server=${proxy.type === 'socks5' ? 'socks5://' : 'http://'}${proxy.host}:${proxy.port}`);
    }

    try {
      const browser = await puppeteer.launch(launchOptions);
      
      // Create a new page with stealth settings
      const page = await browser.newPage();
      
      // Randomize viewport
      await page.setViewport({
        width: 1920 + Math.floor(Math.random() * 200),
        height: 1080 + Math.floor(Math.random() * 200),
        deviceScaleFactor: 1,
      });

      // Randomize user agent
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0'
      ];
      
      await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
      
      // Set additional headers to appear more human
      await page.setExtraHTTPHeaders({
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

      // Store browser and page
      const browserInstance = {
        browser,
        page,
        proxy,
        createdAt: new Date(),
        usedCount: 0
      };
      
      this.browsers.push(browserInstance);
      return browserInstance;
    } catch (error) {
      console.error('Error creating browser:', error);
      throw error;
    }
  }

  async getBrowser() {
    // Try to reuse an existing browser
    if (this.browsers.length > 0) {
      const browserInstance = this.browsers[this.currentBrowserIndex];
      this.currentBrowserIndex = (this.currentBrowserIndex + 1) % this.browsers.length;
      
      // Check if browser is still connected
      if (browserInstance.browser.isConnected()) {
        browserInstance.usedCount++;
        return browserInstance;
      } else {
        // Remove disconnected browser
        this.browsers.splice(this.currentBrowserIndex, 1);
        return await this.getBrowser(); // Try again
      }
    }
    
    // Create a new browser if none available
    return await this.createNewBrowser();
  }

  async rotateBrowser() {
    // Close current browser and create a new one
    if (this.browsers.length > 0) {
      const browserInstance = this.browsers[0];
      try {
        await browserInstance.browser.close();
      } catch (error) {
        console.error('Error closing browser:', error);
      }
      this.browsers.shift();
    }
    
    return await this.createNewBrowser();
  }

  async closeAllBrowsers() {
    for (const browserInstance of this.browsers) {
      try {
        await browserInstance.browser.close();
      } catch (error) {
        console.error('Error closing browser:', error);
      }
    }
    this.browsers = [];
  }

  async cleanup() {
    await this.closeAllBrowsers();
  }
}

module.exports = BrowserManager;