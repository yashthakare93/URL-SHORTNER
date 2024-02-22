// setting up a Mongoose Schema for URLs
const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
    {
        shortId: {
            type: String,
            require: true,
            unique: true,
        },
        redirectURL: {
            type: String,
            require: true,
        },
        visitsHistory: [{ timestamp: { type: Number } }],
    }, { timestamps: true }
);

const URL = mongoose.model("url", urlSchema);
module.exports = URL;