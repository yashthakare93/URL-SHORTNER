const express = require('express');
const { handleNewShortUrlGeneration ,handleGetAnalytics} = require('../controllers/url');
const router = express.Router();

router.post('/', handleNewShortUrlGeneration);
router.get('/analytics/:shortId', handleGetAnalytics);
module.exports = router;
