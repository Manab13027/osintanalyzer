const BaseScraper = require('./base-scraper');

class TwitterScraper extends BaseScraper {
  constructor(config) {
    super('twitter', config);
    this.baseUrl = 'https://twitter.com';
  }

  async execute(query) {
    const results = {
      platform: 'Twitter',
      query,
      profiles: []
    };

    try {
      // Navigate to Twitter
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
      
      // Try to search for the user
      const searchQuery = encodeURIComponent(query);
      const searchUrl = `https://twitter.com/search?q=${searchQuery}&src=typed_query&f=user`;
      
      await this.page.goto(searchUrl, { waitUntil: 'networkidle2' });
      
      // Wait for search results to load
      await this.page.waitForSelector('[data-testid="UserCell"]', { timeout: 10000 });
      
      // Extract search results
      const profiles = await this.page.evaluate(() => {
        const results = [];
        const userCells = document.querySelectorAll('[data-testid="UserCell"]');
        
        userCells.forEach(cell => {
          const nameElement = cell.querySelector('[data-testid="UserName"]');
          const handleElement = cell.querySelector('a[href*="/"]');
          const bioElement = cell.querySelector('[data-testid="UserDescription"]');
          const verifiedElement = cell.querySelector('[data-testid="UserVerifiedBadge"]');
          
          if (nameElement && handleElement) {
            const handle = handleElement.getAttribute('href').substring(1); // Remove leading '/'
            
            results.push({
              name: nameElement.textContent.trim(),
              handle: handle,
              url: `https://twitter.com/${handle}`,
              bio: bioElement ? bioElement.textContent.trim() : '',
              verified: !!verifiedElement,
              source: 'Twitter Search'
            });
          }
        });
        
        return results;
      });
      
      // Visit each profile to extract more information
      for (const profile of profiles) {
        try {
          await this.page.goto(profile.url, { waitUntil: 'networkidle2' });
          
          // Extract additional profile information
          const profileData = await this.page.evaluate(() => {
            const locationElement = document.querySelector('[data-testid="UserLocation"]');
            const websiteElement = document.querySelector('[data-testid="UserUrl"]');
            const joinDateElement = document.querySelector('[data-testid="UserJoinDate"]');
            const followingElement = document.querySelector('a[href$="/following"] span span');
            const followersElement = document.querySelector('a[href$="/followers"] span span');
            
            return {
              location: locationElement ? locationElement.textContent.trim() : '',
              website: websiteElement ? websiteElement.textContent.trim() : '',
              joinDate: joinDateElement ? joinDateElement.textContent.trim() : '',
              following: followingElement ? followingElement.textContent.trim() : '',
              followers: followersElement ? followersElement.textContent.trim() : ''
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
      console.error('Error in Twitter scraper:', error.message);
      results.error = error.message;
      return results;
    }
  }
}

module.exports = TwitterScraper;