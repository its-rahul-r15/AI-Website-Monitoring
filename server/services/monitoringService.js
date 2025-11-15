const axios = require('axios');
const Website = require('../models/Website');
const Monitor = require('../models/Monitor');
const Alert = require('../models/Alert');

// Website check karna - Uptime calculation ke saath
const checkWebsite = async (websiteId) => {
  try {
    const website = await Website.findById(websiteId);
    if (!website || !website.monitoringEnabled) {
      return;
    }

    console.log(`Checking website: ${website.url}`);
    
    const startTime = Date.now();
    let response;

    try {
      // Website availability check
      response = await axios.get(website.url, { 
        timeout: 10000,
        validateStatus: () => true // All status codes allowed
      });
      
      const responseTime = Date.now() - startTime;

      // Content check for maintenance pages
      const isMaintenanceMode = checkMaintenanceMode(response.data, response.status, website.url);
      
      if (isMaintenanceMode) {
        // Website maintenance mode mein hai
        await handleWebsiteDown(websiteId, responseTime, 'Maintenance mode detected', website.userId, website.url);
        console.log(`⚠️ Website ${website.url} is in MAINTENANCE mode`);
      } else {
        // Website properly UP hai
        await handleWebsiteUp(websiteId, responseTime, response.data, website.url);
        console.log(`✅ Website ${website.url} is UP - ${responseTime}ms`);
      }

    } catch (error) {
      // Website completely DOWN hai
      const responseTime = Date.now() - startTime;
      await handleWebsiteDown(websiteId, responseTime, error.message, website.userId, website.url);
      console.log(`❌ Website ${website.url} is DOWN - ${error.message}`);
    }

  } catch (error) {
    console.error(`Error checking website ${websiteId}:`, error);
  }
};

// Maintenance mode check karna
const checkMaintenanceMode = (html, statusCode, url) => {
  try {
    // Convert HTML to lowercase for case-insensitive check
    const htmlLower = String(html).toLowerCase();
    
    // Common maintenance page indicators
    const maintenanceIndicators = [
      'temporarily stopped',
      'maintenance mode',
      'site under maintenance',
      'coming soon',
      'be right back',
      'unavailable',
      'stopped',
      'paused',
      'suspended'
    ];

    // Check if any maintenance indicator exists in HTML
    const hasMaintenanceText = maintenanceIndicators.some(indicator => 
      htmlLower.includes(indicator)
    );

    // Also check for non-200 status codes (except redirects)
    const isErrorStatus = statusCode >= 400 && statusCode < 600;

    return hasMaintenanceText || isErrorStatus;
  } catch (error) {
    // If any error in content checking, assume not maintenance
    console.error('Error in maintenance check:', error);
    return false;
  }
};

// Website UP handle karna
const handleWebsiteUp = async (websiteId, responseTime, html, url) => {
  try {
    const newUptime = await calculateUptime(websiteId, true);
    
    // Update website with uptime
    await Website.findByIdAndUpdate(websiteId, {
      lastChecked: new Date(),
      status: 'up',
      responseTime: responseTime,
      uptime: newUptime,
      performanceScore: calculatePerformanceScore(responseTime),
      seoScore: calculateSEOScore(html),
      sslValid: url.startsWith('https://')
    });

    // Save monitoring data
    await Monitor.create({
      websiteId: websiteId,
      checkTime: new Date(),
      status: 'up',
      responseTime: responseTime,
      performanceMetrics: {
        performance: calculatePerformanceScore(responseTime),
        accessibility: 85,
        bestPractices: 80,
        seo: calculateSEOScore(html)
      },
      issues: []
    });

  } catch (error) {
    console.error('Error handling website up:', error);
  }
};

// Website DOWN handle karna
const handleWebsiteDown = async (websiteId, responseTime, errorMessage, userId, url) => {
  try {
    const newUptime = await calculateUptime(websiteId, false);
    
    await Website.findByIdAndUpdate(websiteId, {
      lastChecked: new Date(),
      status: 'down',
      responseTime: responseTime,
      uptime: newUptime
    });

    await Monitor.create({
      websiteId: websiteId,
      checkTime: new Date(),
      status: 'down',
      responseTime: responseTime,
      issues: [{
        type: 'downtime', 
        description: errorMessage,
        severity: 'high'
      }]
    });

    // Alert create karo only for real downtime, not maintenance
    if (!errorMessage.includes('Maintenance mode')) {
      await Alert.create({
        userId: userId,
        websiteId: websiteId,
        type: 'downtime',
        title: 'Website Down',
        message: `Website ${url} is not accessible: ${errorMessage}`,
        severity: 'high'
      });
    }

  } catch (error) {
    console.error('Error handling website down:', error);
  }
};

// Uptime calculation function
const calculateUptime = async (websiteId, isUp) => {
  try {
    // Last 24 hours ke checks get karo
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentChecks = await Monitor.find({
      websiteId: websiteId,
      checkTime: { $gte: twentyFourHoursAgo }
    }).sort({ checkTime: 1 });

    // Total checks and successful checks count karo
    const totalChecks = recentChecks.length + 1; // +1 for current check
    const successfulChecks = recentChecks.filter(check => check.status === 'up').length + (isUp ? 1 : 0);

    // Uptime percentage calculate karo
    const uptimePercentage = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 100;
    
    return Math.round(uptimePercentage * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error calculating uptime:', error);
    return 100; // Default uptime
  }
};

// Performance score calculation
const calculatePerformanceScore = (responseTime) => {
  let score = 100;
  
  if (responseTime > 5000) score -= 40;
  else if (responseTime > 3000) score -= 25;
  else if (responseTime > 1000) score -= 15;
  
  return Math.max(0, Math.min(100, score));
};

// SEO score calculation (basic)
const calculateSEOScore = (html) => {
  try {
    let score = 100;
    const htmlString = String(html).toLowerCase();
    
    // Basic SEO checks (safe checks)
    if (!htmlString.includes('<title>')) score -= 20;
    if (!htmlString.includes('meta name="description"')) score -= 20;
    if (!htmlString.includes('<h1>')) score -= 15;
    if (!htmlString.includes('alt=')) score -= 15;
    
    return Math.max(0, score);
  } catch (error) {
    console.error('Error calculating SEO score:', error);
    return 50; // Default score if error
  }
};

// All websites check karna
const checkAllWebsites = async () => {
  try {
    const websites = await Website.find({ monitoringEnabled: true });
    console.log(`🔄 Checking ${websites.length} websites...`);
    
    for (const website of websites) {
      await checkWebsite(website._id);
      // Thoda wait karo between checks
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('✅ All websites checked successfully');
  } catch (error) {
    console.error('Error checking all websites:', error);
  }
};

module.exports = {
  checkWebsite,
  checkAllWebsites
};