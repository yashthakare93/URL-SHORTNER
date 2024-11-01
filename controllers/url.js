const URL = require('../models/url');
const shortID = require('shortid');
const config = require('../config');

//generates new shortUrl
async function handleNewShortUrlGeneration(req, res) {
    const body = req.body;
    // if (!body.url) return res.status(400).json({ error: 'URL is required!' });

    const newShortId = shortID.generate(); // Generating a new short ID

    try {
        const createdURL = await URL.create({
            shortId: newShortId,
            redirectURL: body.url,
            visitsHistory: [],
            createdBy: req.user._id,
        });
        // return res.render('home', { id: createdURL.shortId , baseUrl : config.baseUrl});
        return res.redirect('/?shortId='+createdURL.shortId );
    } catch (error) {
        console.error("Error creating new short URL:", error);
        return res.status(400).json(error);
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
