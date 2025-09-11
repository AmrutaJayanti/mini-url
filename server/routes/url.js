const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');

router.post('/shorten', urlController.shortenUrl);
router.get('/:shortCode', urlController.redirect);
router.get('/statistics/:shortCode', urlController.getStatistics);

module.exports = router;