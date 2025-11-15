const express = require('express');
const { 
  manualCheck, 
  getMonitoringHistory, 
  getWebsiteStats 
} = require('../controllers/monitorController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/check/:websiteId', manualCheck);
router.get('/history/:websiteId', getMonitoringHistory);
router.get('/stats/:websiteId', getWebsiteStats);

module.exports = router;