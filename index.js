const express = require('express');
const path = require('path');
const cors = require('cors'); 
const URL = require('./models/url');
const cookieParser = require('cookie-parser');

const urlRoutes = require('./routes/url');
const staticRoute = require('./routes/staticRouter');
const userRoute = require('./routes/user');

const {validateToLoggedinUser,checkAuth} = require('./middelware/auth');

const { initMogoConnection } = require('./connection');
const app = express();
const PORT = 8001;

initMogoConnection("mongodb://localhost:27017/short-url").then(() => {
    console.log('MongoDB started successfully');
}).catch(error => {
    console.error('Error starting MongoDB:', error);
    process.exit(1);
});

app.set("view engine","ejs");
app.set('views',path.resolve('./views'));

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());


app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.use('/url',validateToLoggedinUser, urlRoutes);
app.use('/',checkAuth,staticRoute);
app.use('/user',userRoute);


app.get('/url/:shortId', async (req, res) => {

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


app.listen(PORT,'0.0.0.0', () => {
    console.log(`Server started at port: ${PORT}`);
});
