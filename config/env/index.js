const dev = require('./development');
const prod = require('./product');
module.exports = process.env.NODE_ENV === 'product' ? prod : dev;
