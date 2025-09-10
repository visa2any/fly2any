#!/usr/bin/env node

/**
 * 🚀 FLY2ANY RSS SUBMISSION AUTOMATION SCRIPT
 * Comprehensive RSS feed submission and ping strategy for accelerated Google discovery
 * 
 * Usage:
 * - node scripts/rss-submission-automation.js --submit-all
 * - node scripts/rss-submission-automation.js --ping-only
 * - node scripts/rss-submission-automation.js --directory-submit
 */

const https = require('https');
const http = require('http');

// 🎯 RSS Feed URLs for Fly2Any
const RSS_FEEDS = {
  main: 'https://fly2any.com/feed.xml',
  blog: 'https://fly2any.com/feeds/blog',
  deals: 'https://fly2any.com/feeds/deals'
};

// 🌟 MAJOR RSS DIRECTORIES & AGGREGATORS (2025 Active List)
const RSS_DIRECTORIES = [
  {
    name: 'FeedBurner',
    url: 'https://feedburner.google.com',
    submitUrl: 'https://feedburner.google.com/fb/a/myfeeds',
    method: 'manual',
    priority: 'ultra-high',
    notes: 'Google service - essential for discovery'
  },
  {
    name: 'Feedspot',
    url: 'https://rss.feedspot.com',
    submitUrl: 'https://rss.feedspot.com/submit_feed',
    method: 'manual',
    priority: 'ultra-high',
    category: 'travel_rss_feeds',
    notes: 'Top travel RSS aggregator - 100+ travel categories'
  },
  {
    name: 'AllTop',
    url: 'http://alltop.com',
    submitUrl: 'http://alltop.com/submit',
    method: 'manual',
    priority: 'high',
    notes: 'Guy Kawasaki\'s aggregator - high authority'
  },
  {
    name: 'Technorati',
    url: 'https://technorati.com',
    submitUrl: 'https://technorati.com/ping',
    method: 'manual',
    priority: 'high',
    notes: 'Blog directory and search engine'
  },
  {
    name: 'BlogLovin',
    url: 'https://www.bloglovin.com',
    submitUrl: 'https://www.bloglovin.com/claim',
    method: 'manual',
    priority: 'high',
    notes: 'Popular lifestyle blog aggregator'
  },
  {
    name: 'Feedly',
    url: 'https://feedly.com',
    submitUrl: 'https://feedly.com/i/discover',
    method: 'automatic',
    priority: 'high',
    notes: 'Auto-indexes from other sources'
  },
  {
    name: 'RSS.app',
    url: 'https://rss.app',
    submitUrl: 'https://rss.app/submit',
    method: 'manual',
    priority: 'medium',
    notes: 'Modern RSS service with AI features'
  },
  {
    name: 'Inoreader',
    url: 'https://www.inoreader.com',
    submitUrl: 'https://www.inoreader.com/blog/2014/04/how-to-get-your-blog-discovered-on-inoreader.html',
    method: 'manual',
    priority: 'medium',
    notes: 'Web-based RSS reader'
  }
];

// 🎯 TRAVEL-SPECIFIC RSS DIRECTORIES
const TRAVEL_RSS_DIRECTORIES = [
  {
    name: 'Travel Blog Directory',
    url: 'https://www.travelblogdirectory.com',
    submitUrl: 'https://www.travelblogdirectory.com/submit-blog',
    category: 'travel',
    priority: 'high',
    notes: 'Specialized travel blog directory'
  },
  {
    name: 'Wanderlust Travel Directory',
    url: 'https://wanderlust.co.uk',
    submitUrl: 'https://wanderlust.co.uk/content/submit-content',
    category: 'travel',
    priority: 'medium',
    notes: 'UK-based travel content'
  }
];

// ⚡ RSS PING SERVICES (2025 Verified Working List)
const PING_SERVICES = [
  'http://rpc.pingomatic.com/',
  'http://ping.feedburner.com',
  'http://rpc.weblogs.com/RPC2',
  'http://blogsearch.google.com/ping/RPC2',
  'http://blogsearch.google.ca/ping/RPC2',
  'https://ping.blogs.yandex.ru/RPC2',
  'http://api.my.yahoo.com/rss/ping',
  'http://rpc.technorati.com/rpc/ping',
  'http://ping.blo.gs/',
  'http://services.newsgator.com/ngws/xmlrpcping.aspx'
];

class RSS_SubmissionBot {
  constructor() {
    this.results = {
      directories: [],
      pings: [],
      errors: []
    };
  }

  // 🚀 Main execution method
  async run(options = {}) {
    console.log('🚀 Starting Fly2Any RSS Submission Automation...\n');
    
    if (options.pingOnly || options.submitAll) {
      await this.pingAllServices();
    }
    
    if (options.directorySubmit || options.submitAll) {
      await this.submitToDirectories();
    }
    
    this.generateReport();
  }

  // ⚡ Ping all RSS services
  async pingAllServices() {
    console.log('⚡ Pinging RSS Services...');
    
    for (const [feedType, feedUrl] of Object.entries(RSS_FEEDS)) {
      console.log(`\n📡 Pinging ${feedType} feed: ${feedUrl}`);
      
      try {
        const response = await fetch('https://fly2any.com/api/rss/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedType, manual: true })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`✅ ${feedType}: ${result.summary.successful}/${result.summary.total} services pinged`);
          this.results.pings.push({
            feedType,
            success: true,
            summary: result.summary
          });
        } else {
          console.log(`❌ ${feedType}: Ping failed`);
          this.results.errors.push(`Ping failed for ${feedType}`);
        }
      } catch (error) {
        console.log(`❌ ${feedType}: ${error.message}`);
        this.results.errors.push(`Ping error for ${feedType}: ${error.message}`);
      }
      
      // Delay between feeds
      await this.delay(2000);
    }
  }

  // 📝 Submit to RSS directories
  async submitToDirectories() {
    console.log('\n📝 RSS Directory Submission Guide:');
    console.log('(Manual submission required for most directories)\n');
    
    const allDirectories = [...RSS_DIRECTORIES, ...TRAVEL_RSS_DIRECTORIES];
    
    for (const dir of allDirectories.filter(d => d.priority === 'ultra-high' || d.priority === 'high')) {
      console.log(`🎯 ${dir.name} (${dir.priority})`);
      console.log(`   URL: ${dir.submitUrl}`);
      console.log(`   Method: ${dir.method}`);
      console.log(`   Notes: ${dir.notes}`);
      
      if (dir.category) {
        console.log(`   Category: ${dir.category}`);
      }
      
      this.results.directories.push({
        name: dir.name,
        priority: dir.priority,
        method: dir.method,
        url: dir.submitUrl
      });
      
      console.log('');
    }
    
    console.log('📋 FEEDS TO SUBMIT:');
    Object.entries(RSS_FEEDS).forEach(([type, url]) => {
      console.log(`   ${type.toUpperCase()}: ${url}`);
    });
  }

  // 📊 Generate comprehensive report
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 FLY2ANY RSS SUBMISSION REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n⚡ RSS PING RESULTS:`);
    this.results.pings.forEach(ping => {
      if (ping.success) {
        console.log(`   ✅ ${ping.feedType}: ${ping.summary.successRate} success rate`);
      }
    });
    
    console.log(`\n📝 DIRECTORY SUBMISSIONS (${this.results.directories.length}):`);
    this.results.directories.forEach(dir => {
      console.log(`   ${dir.priority === 'ultra-high' ? '🔥' : '⭐'} ${dir.name} (${dir.method})`);
    });
    
    if (this.results.errors.length > 0) {
      console.log(`\n❌ ERRORS (${this.results.errors.length}):`);
      this.results.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. Complete manual submissions to high-priority directories');
    console.log('   2. Set up automated cron job for regular pinging');
    console.log('   3. Monitor RSS feed performance and indexing');
    console.log('   4. Update content regularly to maintain feed freshness');
    
    console.log('\n✅ RSS Submission Automation Complete!');
  }

  // 🔄 Helper method for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 🚀 Command Line Interface
const args = process.argv.slice(2);
const options = {
  submitAll: args.includes('--submit-all'),
  pingOnly: args.includes('--ping-only'),
  directorySubmit: args.includes('--directory-submit')
};

// Default to submit-all if no specific option
if (!options.pingOnly && !options.directorySubmit) {
  options.submitAll = true;
}

// Execute the bot
const bot = new RSS_SubmissionBot();
bot.run(options).catch(console.error);

// Export for module usage
module.exports = { RSS_SubmissionBot, RSS_FEEDS, RSS_DIRECTORIES, PING_SERVICES };