const Path = require('path');

module.exports = {
    static_path: Path.join(__dirname, '../', 'files'),
    max_age: process.env.MAX_AGE || 300000,
    is_gzip: process.env.GZIP === true,
    is_dev: process.env.NODE_ENV !== 'production',
    max_file_size: process.env.MAX_FILE_SIZE || 100 * 1024 * 1024,
    max_requests_per_interval: process.env.RATE_LIMIT_MAX_REQUESTS || 33,
    max_requests_interval: process.env.RATE_LIMIT_INTERVAL || 15 * 60 * 1000,
};
