const redis = require('redis');
const env = require('./env');
const { log } = require('./utils');
const client = redis.createClient(env.redis);
client.on('connect', () => {
	log('blue', 'redis 连接成功!');
});
client.on('error', function (err) {
	log('red', 'redis 连接错误: ' + err);
});
module.exports = client;