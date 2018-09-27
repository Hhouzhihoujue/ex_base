const mongoose = require('mongoose');
const { mongo } = require('./env');
const { log } = require('./utils');

const db = mongoose.connection;

db.on('error', err => {
	log('red', 'mongo 连接出错: ' + err);
});

db.once('open', () => {
	log('blue', 'mongo 连接成功!');
});

db.on('disconnected', () => {
	log('red', 'mongo 连接已断开!');
});

mongoose.connect(mongo.url, mongo.params);
