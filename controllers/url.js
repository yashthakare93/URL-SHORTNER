const URL = require('../models/url');
const shortID = require('shortid');

//generates new shortUrl
async function handleNewShortUrlGeneration(req, res) {
    const body = req.body;
    if (!body.url) return res.status(400).json({ error: 'URL is required!' });

    const newShortId = shortID.generate(); // Generating a new short ID

    try {
        const createdURL = await URL.create({
            shortId: newShortId,
            redirectURL: body.url,
            visitsHistory: [],
        });
        return res.render('home', { id: createdURL.shortId });
    } catch (error) {
        console.error("Error creating new short URL:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


async function handleGetAnalytics(req, res) {
    const shortId = req.params.shortId;
    const result = await URL.findOne({ shortId });
    return res.json({
        TotalClicks: result.visitsHistory.length,
        Analytics: result.visitsHistory
    })
}

module.exports = {
    handleNewShortUrlGeneration, handleGetAnalytics
}
