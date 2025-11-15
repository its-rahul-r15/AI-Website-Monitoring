const express = require('express');
const {
  connectTelegram,
  sendWebsiteSummary,
  getConnectionStatus,
  disconnectTelegram
} = require('../controllers/telegramController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(auth);

router.post('/connect', connectTelegram);
router.post('/summary/:websiteId', sendWebsiteSummary);
router.get('/connection-status', getConnectionStatus);
router.post('/disconnect', disconnectTelegram);

module.exports = router;