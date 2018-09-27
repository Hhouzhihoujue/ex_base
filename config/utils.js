const fs = require('fs');
const glob = require('glob');
const path = require('path');
const chalk = require('chalk');
const moment = require('moment');
const mongoose = require('mongoose');

// 遍历文件
const globPath = p => {
	return new Promise((resolve, reject) => {
		try {
			let files = glob.sync(path.resolve(__dirname, p));
			return resolve(files);
		} catch (error) {
			return reject(error);
		}
	});
};
// 记录日志
const logger = (type, msg) => {
	let fileName = `log-${type}-${moment().format('YYYYMMDD')}`;
	let filePath = `./logs/${fileName}`;
	msg = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${msg} \n`;
	fs.appendFile(filePath, msg, err => {
		if (err) console.log(chalk['red'](`写入日志错误： \n ${err}`));
	})
}
// 打印日志
const log = (color = 'green', msg) => {
	console.log(chalk[color](msg));
	if (color === 'red') logger('error', msg);
};
// rest实体
class Resp {
	constructor(code, msg, data = null) {
		this.code = code;
		this.msg = msg;
		this.data = data;
	}
};
// 验证objectId
const validObjectId = ids => {
	let valid = mongoose.Types.ObjectId.isValid;
	let isValid = true;
	if(!(ids instanceof Array)) ids = [ids];
	ids.forEach(id => {
		if(!valid(id)) isValid = false;
	});
	return isValid
}

module.exports = {
	globPath,
	log,
	logger,
	Resp,
	validObjectId
};
