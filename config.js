require('dotenv').config();

const isLocal = process.env.NODE_ENV === 'development';

const config = {
    baseUrl: isLocal ? process.env.BASE_URL_LOCAL : process.env.BASE_URL_DEPLOYED,
    mongoConnString: isLocal ? process.env.MONGO_CONN_STRING_LOCAL : process.env.MONGO_CONN_STRING_DEPLOYED
};

module.exports = config;
