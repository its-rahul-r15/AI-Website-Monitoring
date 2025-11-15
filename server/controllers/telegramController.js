const User = require('../models/User');
const Website = require('../models/Website');
const Monitor = require('../models/Monitor');
const telegramService = require('../services/telegramService');

// Simple connect function
const connectTelegram = async (req, res) => {
  try {
    const { chatId } = req.body;
    const userId = req.user.id;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID is required'
      });
    }

    console.log(`🔗 Connecting Telegram for user ${userId}, chatId: ${chatId}`);

    // Test message bhej kar verify karo
    try {
      await telegramService.sendMessage(chatId, 
        '✅ <b>Telegram Connected Successfully!</b>\n\n' +
        'Your AI Website Monitor is now connected. You will receive alerts and reports here.\n\n' +
        'Test message from alextelegram5656bot 🤖'
      );
    } catch (telegramError) {
      return res.status(400).json({
        success: false,
        message: `Invalid Chat ID: ${telegramError.message}`
      });
    }

    // Database mein save karo
    const user = await User.findByIdAndUpdate(
      userId,
      { telegramChatId: chatId },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Telegram connected successfully! ✅',
      data: { user }
    });

  } catch (error) {
    console.error('Telegram connect error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while connecting Telegram'
    });
  }
};

// Website summary bhejna
const sendWebsiteSummary = async (req, res) => {
  try {
    const { websiteId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const website = await Website.findOne({ _id: websiteId, userId });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    if (!user.telegramChatId) {
      return res.status(400).json({
        success: false,
        message: 'Please connect your Telegram first'
      });
    }

    // Monitoring data collect karo
    const history = await Monitor.find({ websiteId })
      .sort({ checkTime: -1 })
      .limit(50);

    const totalChecks = history.length;
    const upChecks = history.filter(h => h.status === 'up').length;
    const uptimePercentage = totalChecks > 0 ? (upChecks / totalChecks) * 100 : 0;
    const avgResponseTime = totalChecks > 0 ? 
      history.reduce((sum, h) => sum + (h.responseTime || 0), 0) / totalChecks : 0;

    // Summary bhejo
    await telegramService.sendWebsiteSummary(
      user.telegramChatId, 
      website, 
      { 
        history, 
        statistics: {
          totalChecks,
          upChecks,
          downChecks: totalChecks - upChecks,
          uptimePercentage: Math.round(uptimePercentage * 100) / 100,
          avgResponseTime: Math.round(avgResponseTime * 100) / 100
        },
        currentStats: {
          performanceScore: website.performanceScore || 0,
          seoScore: website.seoScore || 0,
          avgResponseTime: Math.round(avgResponseTime * 100) / 100
        }
      }
    );

    res.json({
      success: true,
      message: 'Website summary sent to Telegram! 📨'
    });

  } catch (error) {
    console.error('Send summary error:', error);
    res.status(500).json({
      success: false,
      message: `Error: ${error.message}`
    });
  }
};

// Get connection status
const getConnectionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('telegramChatId');
    
    res.json({
      success: true,
      data: {
        isConnected: !!user.telegramChatId,
        chatId: user.telegramChatId
      }
    });
  } catch (error) {
    console.error('Connection status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Disconnect Telegram
const disconnectTelegram = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { telegramChatId: null },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Telegram disconnected successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  connectTelegram,
  sendWebsiteSummary,
  getConnectionStatus,
  disconnectTelegram
};