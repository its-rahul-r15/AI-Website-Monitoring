const Website = require('../models/Website');

// Add new website for monitoring
const addWebsite = async (req, res) => {
  try {
    const { name, url, checkInterval } = req.body;
    const userId = req.user.id;

    // Simple URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        message: 'URL must start with http:// or https://'
      });
    }

    // Check if website already exists for this user
    const existingWebsite = await Website.findOne({ userId, url });
    if (existingWebsite) {
      return res.status(400).json({
        success: false,
        message: 'Website already exists in your monitoring list'
      });
    }

    // Create new website
    const website = await Website.create({
      name,
      url,
      userId,
      checkInterval: checkInterval || 5
    });

    res.status(201).json({
      success: true,
      message: 'Website added for monitoring',
      data: {
        website
      }
    });

  } catch (error) {
    console.error('Add website error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding website'
    });
  }
};

// Get all websites for a user
const getWebsites = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const websites = await Website.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        websites,
        count: websites.length
      }
    });

  } catch (error) {
    console.error('Get websites error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching websites'
    });
  }
};

// Get single website details
const getWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const website = await Website.findOne({ _id: id, userId });
    
    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    res.json({
      success: true,
      data: {
        website
      }
    });

  } catch (error) {
    console.error('Get website error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching website'
    });
  }
};

// Update website
const updateWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, checkInterval, monitoringEnabled } = req.body;

    const website = await Website.findOneAndUpdate(
      { _id: id, userId },
      { name, checkInterval, monitoringEnabled },
      { new: true }
    );

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    res.json({
      success: true,
      message: 'Website updated successfully',
      data: {
        website
      }
    });

  } catch (error) {
    console.error('Update website error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating website'
    });
  }
};

// Delete website
const deleteWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const website = await Website.findOneAndDelete({ _id: id, userId });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    res.json({
      success: true,
      message: 'Website deleted successfully'
    });

  } catch (error) {
    console.error('Delete website error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting website'
    });
  }
};

module.exports = {
  addWebsite,
  getWebsites,
  getWebsite,
  updateWebsite,
  deleteWebsite
};