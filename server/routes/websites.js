const express = require('express');
const { 
  addWebsite, 
  getWebsites, 
  getWebsite, 
  updateWebsite, 
  deleteWebsite 
} = require('../controllers/websiteController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(auth);

router.post('/', addWebsite);
router.get('/', getWebsites);
router.get('/:id', getWebsite);
router.put('/:id', updateWebsite);
router.delete('/:id', deleteWebsite);

module.exports = router;