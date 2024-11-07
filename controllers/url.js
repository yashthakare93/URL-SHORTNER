const URL = require('../models/url');
const shortID = require('shortid');
const config = require('../config');

// Generates new shortUrl or returns existing one if it already exists
async function handleNewShortUrlGeneration(req, res) {
    const body = req.body;
    if (!body.url) return res.status(400).json({ error: 'URL is required!' });

    try {
        // Check if the URL already exists
        const existingURL = await URL.findOne({ redirectURL: body.url, createdBy: req.user._id });

        if (existingURL) {
            // URL already exists, return the existing shortId
            return res.redirect('/?shortId=' + existingURL.shortId);
        }

        // If URL doesn't exist, create a new short URL
        const newShortId = shortID.generate();
        const createdURL = await URL.create({
            shortId: newShortId,
            redirectURL: body.url,
            visitsHistory: [],
            createdBy: req.user._id, // Assuming the user is authenticated
        });

        return res.redirect('/?shortId=' + createdURL.shortId);
    } catch (error) {
        console.error("Error handling short URL generation:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleGetAnalytics(req, res) {
    const shortId = req.params.shortId;
    try {
        const result = await URL.findOne({ shortId });

        if (!result) {
            return res.status(404).json({ error: 'Short URL not found!' });
        }

        return res.json({
            TotalClicks: result.visitsHistory.length,
            Analytics: result.visitsHistory
        });
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    handleNewShortUrlGeneration,
    handleGetAnalytics
};
