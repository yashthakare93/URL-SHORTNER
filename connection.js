const mongoose = require('mongoose');

async function initMogoConnection(url) {
    return mongoose.connect(url);
}

module.exports = {
    initMogoConnection,
};
