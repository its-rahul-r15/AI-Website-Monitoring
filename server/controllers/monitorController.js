const Monitor = require('../models/Monitor');
const Website = require('../models/Website');
const { checkWebsite } = require('../services/monitoringService');

// Manual website check
const manualCheck = async (req, res) => {
  try {
    const { websiteId } = req.params;
    
    // Check karo ki website user ki hai
    const website = await Website.findOne({ 
      _id: websiteId, 
      userId: req.user.id 
    });
    
    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    // Manual check start karo
    await checkWebsite(websiteId);

    res.json({
      success: true,
      message: 'Manual check initiated'
    });

  } catch (error) {
    console.error('Manual check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during manual check'
    });
  }
};

// Get monitoring history for a website
const getMonitoringHistory = async (req, res) => {
  try {
    const { websiteId } = req.params;
    const { limit = 50 } = req.query;
    
    // Verify website ownership
    const website = await Website.findOne({ 
      _id: websiteId, 
      userId: req.user.id 
    });
    
    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    const history = await Monitor.find({ websiteId })
      .sort({ checkTime: -1 })
      .limit(parseInt(limit));

    // Statistics calculate karo
    const totalChecks = history.length;
    const upChecks = history.filter(h => h.status === 'up').length;
    const uptimePercentage = totalChecks > 0 ? (upChecks / totalChecks) * 100 : 0;
    
    const avgResponseTime = history.length > 0 
      ? history.reduce((sum, h) => sum + (h.responseTime || 0), 0) / history.length 
      : 0;

    res.json({
      success: true,
      data: {
        history,
        statistics: {
          totalChecks,
          upChecks,
          downChecks: totalChecks - upChecks,
          uptimePercentage: Math.round(uptimePercentage * 100) / 100,
          avgResponseTime: Math.round(avgResponseTime * 100) / 100
        }
      }
    });

  } catch (error) {
    console.error('Get monitoring history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching monitoring history'
    });
  }
};

// Get website statistics
const getWebsiteStats = async (req, res) => {
  try {
    const { websiteId } = req.params;
    
    const website = await Website.findOne({ 
      _id: websiteId, 
      userId: req.user.id 
    });
    
    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    // Last 24 hours ka data
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentChecks = await Monitor.find({
      websiteId,
      checkTime: { $gte: twentyFourHoursAgo }
    }).sort({ checkTime: 1 });

    // Uptime calculation
    const totalRecentChecks = recentChecks.length;
    const upRecentChecks = recentChecks.filter(h => h.status === 'up').length;
    const recentUptime = totalRecentChecks > 0 ? (upRecentChecks / totalRecentChecks) * 100 : 0;

    // Response time trend
    const responseTimes = recentChecks.map(h => ({
      time: h.checkTime,
      responseTime: h.responseTime
    }));

    res.json({
      success: true,
      data: {
        currentStatus: website.status,
        uptime24h: Math.round(recentUptime * 100) / 100,
        performanceScore: website.performanceScore,
        seoScore: website.seoScore,
        sslValid: website.sslValid,
        lastChecked: website.lastChecked,
        responseTimes: responseTimes
      }
    });

  } catch (error) {
    console.error('Get website stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching website stats'
    });
  }
};

module.exports = {
  manualCheck,
  getMonitoringHistory,
  getWebsiteStats
};