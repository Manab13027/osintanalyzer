const BaseScraper = require('./base-scraper');
const cheerio = require('cheerio');

class GlobalScraper extends BaseScraper {
  constructor() {
    super();
    
    // Platform-specific configurations
    this.platformConfigs = {
      'LinkedIn': {
        searchUrl: 'https://www.linkedin.com/search/results/people/',
        searchInput: 'input[placeholder="Search"]',
        resultsSelector: '.search-result__info',
        nameSelector: '.search-result__name',
        usernameSelector: '.search-result__subtitle',
        avatarSelector: '.search-result__image img',
        bioSelector: '.search-result__snippet'
      },
      'X / Twitter': {
        searchUrl: 'https://twitter.com/search',
        searchInput: 'input[placeholder="Search Twitter"]',
        resultsSelector: '[data-testid="tweet"]',
        nameSelector: '[data-testid="User-Name"] span',
        usernameSelector: '[data-testid="User-Name"] span:nth-child(2)',
        avatarSelector: 'img[data-testid="UserAvatar-Container-"]',
        bioSelector: '[data-testid="UserDescription"]'
      },
      'Instagram': {
        searchUrl: 'https://www.instagram.com/explore/tags/',
        searchInput: 'input[placeholder="Search"]',
        resultsSelector: '.v1Nh3',
        nameSelector: '.FPmhX',
        usernameSelector: '.e1e1d',
        avatarSelector: '.KL4Bh img',
        bioSelector: '.-vDIg span'
      },
      'Facebook': {
        searchUrl: 'https://www.facebook.com/search/people/',
        searchInput: 'input[placeholder="Search Facebook"]',
        resultsSelector: '.buofh1pr',
        nameSelector: '.oajrlxb2',
        usernameSelector: '.gmql0nx0',
        avatarSelector: 'img',
        bioSelector: '.ecm0bbzt'
      },
      'TikTok': {
        searchUrl: 'https://www.tiktok.com/search/user?q=',
        searchInput: 'input[type="search"]',
        resultsSelector: '[data-e2e="search_user_container"]',
        nameSelector: '[data-e2e="search_user_username"]',
        usernameSelector: '[data-e2e="search_user_nickname"]',
        avatarSelector: '[data-e2e="search_user_avatar"] img',
        bioSelector: '[data-e2e="search_user_desc"]'
      },
      'YouTube': {
        searchUrl: 'https://www.youtube.com/results?search_query=',
        searchInput: 'input[name="search_query"]',
        resultsSelector: '.ytd-video-renderer',
        nameSelector: '.ytd-channel-name',
        usernameSelector: '.ytd-channel-name a',
        avatarSelector: '.yt-img-shadow',
        bioSelector: '.ytd-channel-renderer'
      },
      'Reddit': {
        searchUrl: 'https://www.reddit.com/search/',
        searchInput: '#header-search-bar',
        resultsSelector: '.SearchResult',
        nameSelector: '._3AStxqlp',
        usernameSelector: '._2ETuFsVf',
        avatarSelector: '_2jdERn54 img',
        bioSelector: '_1hLrLjnU'
      },
      'Pinterest': {
        searchUrl: 'https://www.pinterest.com/search/people/',
        searchInput: 'input[placeholder="Search for ideas"]',
        resultsSelector: '.Yl-.MIw.Hb7',
        nameSelector: '.tBJ.dyH.iFc.H2s',
        usernameSelector: '.tBJ.dyH.iFc.zDA',
        avatarSelector: '.XbG.zI7.iyn.Hsu img',
        bioSelector: '.tBJ.dyH.iFc.zI7'
      },
      'Discord': {
        searchUrl: 'https://discord.com/users/',
        searchInput: 'input[placeholder="Find or start a conversation"]',
        resultsSelector: '.container-3ayLPN',
        nameSelector: '.username-1A8OIy',
        usernameSelector: '.discriminator-1_9YbQ',
        avatarSelector: '.avatar-1BDn8e img',
        bioSelector: '.customStatus-1e2EQj'
      },
      'Twitch': {
        searchUrl: 'https://www.twitch.tv/search',
        searchInput: 'input[aria-label="Search Input"]',
        resultsSelector: '.tw-tower',
        nameSelector: '.tw-strong',
        usernameSelector: '.tw-ellipsis',
        avatarSelector: '.tw-avatar img',
        bioSelector: '.tw-c-text-base'
      },
      'Threads': {
        searchUrl: 'https://www.threads.net/search',
        searchInput: 'input[placeholder="Search"]',
        resultsSelector: '.x1lliihq',
        nameSelector: '.x1i10hfl',
        usernameSelector: '.x1q0g3np',
        avatarSelector: '.x78zum5 img',
        bioSelector: '.x1i10hfl'
      },
      'Snapchat': {
        searchUrl: 'https://www.snapchat.com/add/',
        searchInput: 'input[placeholder="Search"]',
        resultsSelector: '.profile-card',
        nameSelector: '.profile-name',
        usernameSelector: '.profile-username',
        avatarSelector: '.profile-avatar img',
        bioSelector: '.profile-bio'
      },
      'GitHub': {
        searchUrl: 'https://github.com/search?q=',
        searchInput: 'input[name="q"]',
        resultsSelector: '.user-list-item',
        nameSelector: '.f3',
        usernameSelector: '.f4',
        avatarSelector: '.avatar',
        bioSelector: '.p-note'
      },
      'Medium': {
        searchUrl: 'https://medium.com/search?q=',
        searchInput: 'input[name="query"]',
        resultsSelector: '.js-block',
        nameSelector: '.ds-link',
        usernameSelector: '.ds-link',
        avatarSelector: '.avatar img',
        bioSelector: '.ui-caption'
      },
      'Quora': {
        searchUrl: 'https://www.quora.com/search?q=',
        searchInput: 'input[name="q"]',
        resultsSelector: '.UserLink',
        nameSelector: '.user',
        usernameSelector: '.name',
        avatarSelector: '.profile_photo_img',
        bioSelector: '.bio'
      },
      'Tumblr': {
        searchUrl: 'https://www.tumblr.com/search/',
        searchInput: '.search_form input',
        resultsSelector: '.post',
        nameSelector: '.post_title',
        usernameSelector: '.post_info',
        avatarSelector: '.avatar img',
        bioSelector: '.post_body'
      },
      'Flickr': {
        searchUrl: 'https://www.flickr.com/search/people/',
        searchInput: 'input[name="q"]',
        resultsSelector: '.person',
        nameSelector: '.person-name',
        usernameSelector: '.person-username',
        avatarSelector: '.person-avatar img',
        bioSelector: '.person-bio'
      },
      'Rumble': {
        searchUrl: 'https://rumble.com/search',
        searchInput: 'input[name="search.query"]',
        resultsSelector: '.video-listing--item',
        nameSelector: '.video-item--title',
        usernameSelector: '.video-item--by',
        avatarSelector: '.thumbnail__image',
        bioSelector: '.video-item--description'
      },
      'Clubhouse': {
        searchUrl: 'https://www.clubhouse.com/search',
        searchInput: 'input[placeholder="Search"]',
        resultsSelector: '.user-item',
        nameSelector: '.name',
        usernameSelector: '@username',
        avatarSelector: '.photo img',
        bioSelector: '.bio'
      },
      'Telegram': {
        searchUrl: 'https://t.me/s/',
        searchInput: '.input-search',
        resultsSelector: '.tgme_page',
        nameSelector: '.tgme_page_title',
        usernameSelector: '.tgme_page_subtitle',
        avatarSelector: '.tgme_page_photo img',
        bioSelector: '.tgme_page_description'
      },
      'Signal': {
        searchUrl: 'https://signal.org/',
        searchInput: 'input[placeholder="Search"]',
        resultsSelector: '.search-result',
        nameSelector: '.result-name',
        usernameSelector: '.result-username',
        avatarSelector: '.result-avatar img',
        bioSelector: '.result-bio'
      },
      'Viber': {
        searchUrl: 'https://www.viber.com/',
        searchInput: 'input[placeholder="Search"]',
        resultsSelector: '.search-result',
        nameSelector: '.result-name',
        usernameSelector: '.result-username',
        avatarSelector: '.result-avatar img',
        bioSelector: '.result-bio'
      },
      'Spotify': {
        searchUrl: 'https://open.spotify.com/search/',
        searchInput: 'input[data-testid="search-input"]',
        resultsSelector: '.search-result',
        nameSelector: '.type-bass',
        usernameSelector: '.type-mesto',
        avatarSelector: '.avatar img',
        bioSelector: '.type-finale'
      },
      'Patreon': {
        searchUrl: 'https://www.patreon.com/search',
        searchInput: 'input[name="q"]',
        resultsSelector: '.sc-fzpans',
        nameSelector: '.sc-AxjAm',
        usernameSelector: '.sc-AxhCb',
        avatarSelector: '.sc-AxirZ img',
        bioSelector: '.sc-AxjIy'
      }
    };
  }
  
  async search(page, targetName, images, threshold) {
    const profiles = [];
    
    for (const [platform, config] of Object.entries(this.platformConfigs)) {
      try {
        this.logger.info(`Searching ${platform} for "${targetName}"`);
        
        // Navigate to search page
        await page.goto(config.searchUrl + encodeURIComponent(targetName), {
          waitUntil: 'networkidle2',
          timeout: this.requestTimeout
        });
        
        // Wait for results to load
        await this.waitForElement(page, config.resultsSelector);
        
        // Extract profiles
        const platformProfiles = await this.extractProfiles(page, platform, config);
        profiles.push(...platformProfiles);
        
        // Add delay between requests to avoid rate limiting
        await this.delay(1000);
      } catch (error) {
        this.logger.error(`Error searching ${platform}:`, error);
      }
    }
    
    return profiles;
  }
  
  async extractProfiles(page, platform, config) {
    const profiles = [];
    
    try {
      // Extract profile data
      const profileData = await page.evaluate((config) => {
        const results = [];
        const elements = document.querySelectorAll(config.resultsSelector);
        
        for (const element of elements) {
          const nameElement = element.querySelector(config.nameSelector);
          const usernameElement = element.querySelector(config.usernameSelector);
          const avatarElement = element.querySelector(config.avatarSelector);
          const bioElement = element.querySelector(config.bioSelector);
          
          if (nameElement) {
            const profile = {
              name: nameElement.textContent.trim(),
              username: usernameElement ? usernameElement.textContent.trim() : '',
              avatar: avatarElement ? avatarElement.src : '',
              bio: bioElement ? bioElement.textContent.trim() : '',
              platform: platform,
              url: window.location.href
            };
            
            results.push(profile);
          }
        }
        
        return results;
      }, config);
      
      profiles.push(...profileData);
    } catch (error) {
      this.logger.error(`Error extracting profiles from ${platform}:`, error);
    }
    
    return profiles;
  }
}

module.exports = GlobalScraper;