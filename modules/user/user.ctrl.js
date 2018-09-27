const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const User = mongoose.model('User');
const redis = require('../../config/redis');
const { initAcl } = require('../../config/acl');
const { JWT_secret, redisKey } = require('../../config/env');
const { log, Resp, validObjectId } = require('../../config/utils');

class UserCtrl {
	// 用户列表
	async list(req, res, next) {
		try {
			let users = await User.find({}, {password: 0}).populate('role');
			res.send(new Resp(1, '查询用户成功!', users));
		} catch (error) {
			log('red', error.stack);
			next(new Error('查询用户出错!'));
		}
	}
	// 新建用户
	async create(req, res, next) {
		let { username, password, role, nickName } = req.body;
		if (!username) return next(new Error('缺少用户名!'));
		if (!password) return next(new Error('缺少密码!'));
		if (!role) return next(new Error('缺少角色id!'));
		try {
			let oldUser = await User.findOne({ username });
			if (oldUser) return next(new Error('此用户已存在!'));
			let userData = { username, password, role };
			if(nickName) userData.nickName = nickName;
			let user = await User.create(userData);
			user = user.toObject();
			delete user.password;
			res.send(new Resp(1, '创建用户成功!', user));
		} catch (err) {
			log('red', err.stack);
			return next(new Error('创建权限失败!'));
		}
	}

	// 修改用户
	async update(req, res, next) {
		let { id, password, role, nickName } = req.body;
		if (!id) return next(new Error('缺少用户id!'));
		try {
			let user = await User.findOne({ _id: id });
			if (!user) return next(new Error('未找到此用户!'));
			if(user.username === 'root') return next(new Error('不允许修改root权限!'));
			if (password) user.password = password;
			if (role) user.role = role;
			if (nickName) user.nickName = nickName;
			let result = await user.save();
			result = JSON.parse(JSON.stringify(result));
			delete result.password;
			initAcl();
			res.send(new Resp(1, '修改用户成功!', result));
		} catch (err) {
			log('red', err.stack);
			next(new Error('修改用户失败!'));
		};
	} 
	// 删除用户
	async del(req, res, next) {
		let { ids } = req.body;
		if (!ids) return next(new Error('缺少用户id!'));
		if (!(ids instanceof Array)) ids = [ids];
		if (!validObjectId(ids)) return next(new Error('用户id错误!'));
		try {
			let users = await User.find({ _id: ids });
			if (users.length === 0) return next(new Error('未找到任何用户!'));
			let containRoot = false;
			users.forEach(item => containRoot = item.username === 'root' ? true : false);
			if(containRoot) return next(new Error('不允许删除root用户!'));
			let unCheckUsers = {};
			ids.forEach(id => {
				unCheckUsers[id] = true;
			});
			users.forEach(user => {
				if (unCheckUsers[user._id]) {
					delete unCheckUsers[user._id]
				};
			});
			if (users.length < ids.length) return next(new Error(`部分用户不存在(${Object.keys(unCheckUsers).join(',')})!`));
			let result = await User.deleteMany({ _id: ids });
			if (result.ok === 1) {
				return res.send(new Resp(1, `删除用户成功!`, null));
			};
		} catch (err) {
			log('red', err.stack);
			return next(new Error('删除用户失败!'));
		}
	}
	// 用户登陆
	async login(req, res, next) {
		let { username, password } = req.body;
		if (!username) return next(new Error('缺少用户名!'));
		if (!password) return next(new Error('缺少密码!'));
		try {
			let user = await User.findOne({ username }).populate('role');
			if (!user) return next(new Error('不存在此用户!'));
			if (password !== user.password) return next(new Error('用户名或密码错误!'));
			const t_exp = parseInt(moment().startOf('day').add(1, 'day').valueOf() / 1000);
			let userInfo = { ...user.toObject(), t_exp };
			delete userInfo.password;
			const token = jwt.sign(userInfo, JWT_secret);
			redis.hset(redisKey.userLoginInfo, user._id.toString(), token, err => {
				if (err) {
					log('red', err.stack);
					return next(new Error('登陆失败!'));
				};
				return res.send(new Resp(1, '登陆成功!', Object.assign(userInfo, { token })))
			})
		} catch (err) {
			log('red', err.stack);
			return next(new Error('登陆失败!'));
		}
	}
}

module.exports = new UserCtrl();
