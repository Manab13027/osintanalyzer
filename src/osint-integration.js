const ScraperFactory = require('./scrapers/scraper-factory');
const ProxyManager = require('./utils/proxy-manager');
const BrowserManager = require('./utils/browser-manager');
const RateLimiter = require('./utils/rate-limiter');
const RobotsBypass = require('./utils/robots-bypass');
const OllamaIntegration = require('./ai/ollama-integration');
const ModelTrainer = require('./ai/model-trainer');
const FaceRecognition = require('./ai/face-recognition');
const config = require('config');

class OSINTIntegration {
  constructor() {
    this.scraperFactory = new ScraperFactory();
    this.proxyManager = new ProxyManager();
    this.browserManager = new BrowserManager();
    this.rateLimiter = new RateLimiter();
    this.robotsBypass = new RobotsBypass();
    this.ollama = new OllamaIntegration();
    this.modelTrainer = new ModelTrainer(this.ollama);
    this.faceRecognition = new FaceRecognition();
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }
    
    try {
      // Initialize all components
      await Promise.all([
        this.proxyManager.initialize(),
        this.browserManager.initialize(),
        this.ollama.initialize(),
        this.faceRecognition.initialize()
      ]);
      
      // Create custom OSINT model if it doesn't exist
      if (!await this.ollama.isModelAvailable('osint-assistant')) {
        console.log('Creating custom OSINT model...');
        await this.modelTrainer.createCustomOSINTModel('llama3', 'osint-assistant');
      }
      
      this.isInitialized = true;
      console.log('OSINT integration initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OSINT integration:', error);
      throw error;
    }
  }

  async executeSearch(targetName, platforms, images, threshold) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const results = {};
    const imageAnalysis = [];
    
    // Analyze images with face recognition
    if (images && images.length > 0) {
      console.log('Analyzing images...');
      
      for (const imagePath of images) {
        try {
          // Detect faces in image
          const faces = await this.faceRecognition.detectFaces(imagePath);
          
          // Extract face descriptors for matching
          const faceDescriptor = await this.faceRecognition.extractFaceDescriptor(imagePath);
          
          // Analyze image with LLaVA model
          const imageDescription = await this.ollama.analyzeImage(
            imagePath,
            'Extract facial features, distinctive characteristics, and any visible text or objects that could help identify this person.'
          );
          
          imageAnalysis.push({
            path: imagePath,
            faces,
            descriptor: faceDescriptor,
            description: imageDescription
          });
        } catch (error) {
          console.error(`Error analyzing image ${imagePath}:`, error.message);
          imageAnalysis.push({
            path: imagePath,
            error: error.message
          });
        }
      }
    }
    
    // Search each platform
    console.log(`Searching ${platforms.length} platforms...`);
    
    for (const platform of platforms) {
      try {
        // Check if platform is blocked
        if (this.rateLimiter.isPlatformBlocked(platform)) {
          console.log(`Platform ${platform} is currently blocked, skipping...`);
          results[platform] = { error: 'Platform temporarily blocked' };
          continue;
        }
        
        // Check rate limit
        if (!await this.rateLimiter.checkRateLimit(platform)) {
          console.log(`Rate limit reached for ${platform}, retrying later...`);
          results[platform] = { error: 'Rate limit reached' };
          continue;
        }
        
        // Get browser with proxy
        const browserInstance = await this.browserManager.getBrowser();
        const page = browserInstance.page;
        
        // Create scraper for platform
        const scraper = this.scraperFactory.createScraper(platform, {
          page: page,
          threshold: threshold,
          imageAnalysis: imageAnalysis,
          robotsBypass: this.robotsBypass
        });
        
        // Execute search
        console.log(`Searching ${platform}...`);
        const platformResults = await scraper.execute(targetName);
        
        // Analyze results with local model
        if (platformResults.profiles && platformResults.profiles.length > 0) {
          const analysisPrompt = `Analyze these search results for "${targetName}" on ${platform}. For each profile, provide:
          1. A confidence score (0-1) that this is the correct person
          2. Key identifying information
          3. Potential red flags or inconsistencies
          
          Results: ${JSON.stringify(platformResults.profiles)}`;
          
          const analysis = await this.ollama.generateText(analysisPrompt, 'osint-assistant');
          platformResults.analysis = analysis;
        }
        
        results[platform] = platformResults;
        
        // Random delay to avoid detection
        await this.randomDelay(1000, 3000);
      } catch (error) {
        console.error(`Error searching ${platform}:`, error.message);
        
        // Handle platform-specific errors
        if (error.message.includes('blocked') || error.message.includes('403')) {
          await this.rateLimiter.handleBlock(platform);
        }
        
        results[platform] = { error: error.message };
      }
    }
    
    return {
      targetName,
      platforms,
      imageAnalysis,
      results,
      timestamp: new Date().toISOString()
    };
  }

  async randomDelay(min = 1000, max = 3000) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  async cleanup() {
    try {
      await this.browserManager.cleanup();
      console.log('OSINT integration cleanup completed');
    } catch (error) {
      console.error('Error during cleanup:', error.message);
    }
  }
}

module.exports = OSINTIntegration;