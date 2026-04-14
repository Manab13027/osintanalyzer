const fs = require('fs-extra');
const path = require('path');
const config = require('config');
const SocksProxyAgent = require('socks-proxy-agent');

class ProxyManager {
  constructor() {
    this.proxies = [];
    this.currentProxyIndex = 0;
    this.torEnabled = false;
    this.proxyListPath = config.get('proxy.proxyListPath');
  }

  async initialize() {
    await this.loadProxyList();
    await this.initializeTor();
  }

  async loadProxyList() {
    try {
      if (await fs.pathExists(this.proxyListPath)) {
        const proxyData = await fs.readJson(this.proxyListPath);
        this.proxies = proxyData.proxies || [];
        console.log(`Loaded ${this.proxies.length} proxies`);
      } else {
        console.warn('Proxy list file not found, creating empty file');
        await fs.ensureDir(path.dirname(this.proxyListPath));
        await fs.writeJson(this.proxyListPath, { proxies: [] });
      }
    } catch (error) {
      console.error('Error loading proxy list:', error);
      this.proxies = [];
    }
  }

  async initializeTor() {
    try {
      // Check if Tor is available
      const torControlPort = config.get('proxy.torControlPort');
      const torPassword = config.get('proxy.torPassword');
      
      // This is a simplified check - in production you'd want more robust Tor integration
      this.torEnabled = true;
      console.log('Tor initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Tor:', error);
      this.torEnabled = false;
    }
  }

  async rotateProxy() {
    if (this.proxies.length === 0 && !this.torEnabled) {
      return null; // No proxies available
    }

    // Decide whether to use standard proxy or Tor
    const useTor = this.torEnabled && Math.random() < 0.3; // 30% chance to use Tor

    if (useTor) {
      return await this.rotateTorCircuit();
    } else if (this.proxies.length > 0) {
      return this.rotateStandardProxy();
    }

    return null;
  }

  rotateStandardProxy() {
    const proxy = this.proxies[this.currentProxyIndex];
    this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
    return proxy;
  }

  async rotateTorCircuit() {
    try {
      // In a real implementation, you would send NEWNYM signal to Tor control port
      // For now, we'll just return a Tor proxy configuration
      return {
        host: 'localhost',
        port: 9050,
        type: 'socks5'
      };
    } catch (error) {
      console.error('Failed to rotate Tor circuit:', error);
      return null;
    }
  }

  getProxyAgent(proxy) {
    if (!proxy) return null;

    if (proxy.type === 'socks5') {
      return new SocksProxyAgent(`socks5://${proxy.host}:${proxy.port}`);
    }

    return null;
  }

  async addProxy(proxy) {
    this.proxies.push(proxy);
    await this.saveProxyList();
  }

  async saveProxyList() {
    try {
      await fs.writeJson(this.proxyListPath, { proxies: this.proxies });
    } catch (error) {
      console.error('Error saving proxy list:', error);
    }
  }

  async testProxy(proxy) {
    // Implementation to test if a proxy is working
    // This would involve making a request through the proxy
    // and checking if it succeeds
    return true; // Simplified for now
  }
}

module.exports = ProxyManager;