const express = require('express');
const urlRoutes = require('./routes/url');
const cors = require('cors'); 
const URL = require('./models/url')
const { initMogoConnection } = require('./connection');
const app = express();
const PORT = 8001;

initMogoConnection("mongodb://localhost:27017/short-url").then(() => {
    console.log('MongoDB started successfully');
}).catch(error => {
    console.error('Error starting MongoDB:', error);
    process.exit(1);
});

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    const body = req.body;
    if (body.url) {
        const expression = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/i;
        const regex = new RegExp(expression);
        if (regex.test(body.url)) {
            next();
        } else {

            console.log('Invalid URL:', body.url);
            return res.status(400).json({ "error": "Invalid URL." });
        }
    } else {
        next();
    }
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
app.use('/url', urlRoutes);

app.get('/:shortId', async (req, res) => {

    try {
        const shortId = req.params.shortId;
        const entry = await URL.findOneAndUpdate({
            shortId
        },
            {
                $push: {
                    visitsHistory: { timestamp: Date.now() }
                }
            });

        if (!entry) {

            return res.status(404).json({ error: 'URL not found.' });
        }
        res.redirect(entry.redirectURL);
    }
    catch (error){
        console.error('Error retrieving and updating URL entry:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

})


app.listen(PORT, () => {
    console.log(`Server started at port: ${PORT}`);
});
