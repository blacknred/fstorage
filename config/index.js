const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    static_path: path.join(__dirname, '../', 'files'),
    logs_path: path.join(__dirname, '../', 'logs'),
    max_age: process.env.MAX_AGE || 300000,
    is_gzip: process.env.GZIP === true,
    is_dev: process.env.NODE_ENV !== 'production',
    max_file_size: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024 * 1024,
    rate_limit_max_requests: process.env.RATE_LIMIT_MAX_REQUESTS || 33,
    rate_limit_interval: process.env.RATE_LIMIT_INTERVAL || 15 * 60 * 1000,
};
