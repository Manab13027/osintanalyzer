const BaseScraper = require('./base-scraper');

class InstagramScraper extends BaseScraper {
  constructor(config) {
    super('instagram', config);
    this.baseUrl = 'https://www.instagram.com';
  }

  async execute(query) {
    const results = {
      platform: 'Instagram',
      query,
      profiles: []
    };

    try {
      // Instagram doesn't have a public search API, so we'll use Google to find profiles
      const searchQuery = encodeURIComponent(`site:instagram.com "${query}"`);
      const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
      
      await this.page.goto(searchUrl, { waitUntil: 'networkidle2' });
      
      // Extract Instagram profiles from Google search results
      const profiles = await this.page.evaluate(() => {
        const results = [];
        const links = document.querySelectorAll('a[href*="instagram.com/"]');
        
        links.forEach(link => {
          const href = link.getAttribute('href');
          const text = link.textContent.trim();
          
          // Skip non-profile URLs
          if (href.includes('/p/') || href.includes('/explore/') || href.includes('/reel/')) {
            return;
          }
          
          if (href && text) {
            // Extract username from URL
            const match = href.match(/instagram\.com\/([^\/?]+)/);
            if (match && match[1]) {
              results.push({
                url: `https://www.instagram.com/${match[1]}`,
                username: match[1],
                name: text,
                source: 'Google Search'
              });
            }
          }
        });
        
        // Remove duplicates
        const uniqueResults = [];
        const seen = new Set();
        
        for (const result of results) {
          if (!seen.has(result.username)) {
            seen.add(result.username);
            uniqueResults.push(result);
          }
        }
        
        return uniqueResults;
      });
      
      // Visit each profile to extract more information
      for (const profile of profiles) {
        try {
          await this.page.goto(profile.url, { waitUntil: 'networkidle2' });
          
          // Extract profile information
          const profileData = await this.page.evaluate(() => {
            const nameElement = document.querySelector('h2');
            const bioElement = document.querySelector('div.-vDIg span');
            const statsElements = document.querySelectorAll('a[href*="/"] span');
            const verifiedElement = document.querySelector('[data-testid="verified-badge"]');
            
            // Extract stats (posts, followers, following)
            let posts = '', followers = '', following = '';
            if (statsElements.length >= 3) {
              posts = statsElements[0].textContent.trim();
              followers = statsElements[1].textContent.trim();
              following = statsElements[2].textContent.trim();
            }
            
            return {
              name: nameElement ? nameElement.textContent.trim() : '',
              bio: bioElement ? bioElement.textContent.trim() : '',
              posts,
              followers,
              following,
              verified: !!verifiedElement
            };
          });
          
          // Merge with existing profile data
          Object.assign(profile, profileData);
          
          // Add a small delay to avoid rate limiting
          await this.randomDelay(1000, 2000);
        } catch (error) {
          console.error(`Error extracting profile data for ${profile.url}:`, error.message);
          profile.error = error.message;
        }
      }
      
      results.profiles = profiles;
      return results;
    } catch (error) {
      console.error('Error in Instagram scraper:', error.message);
      results.error = error.message;
      return results;
    }
  }
}

module.exports = InstagramScraper;