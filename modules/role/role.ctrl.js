const mongoose = require('mongoose');
const Role = mongoose.model('Role');
const { log, Resp, validObjectId } = require('../../config/utils');

class RoleCtrl {
	// 角色列表
	async list(req, res, next) {
		try {
			let roles = await Role.find({});
			res.send(new Resp(1, '查询角色成功!', roles));
		} catch (err) {
			log('red', err.stack);
			next(new Error('查询角色出错!'));
		}
	}
	// 创建角色
	async create(req, res, next) {
		let { code, name } = req.body;
		if (!code) return next(new Error('缺少角色code!'));
		if (!name) return next(new Error('缺少角色name!'));
		try {
			let role = await Role.findOne({ name });
			if (role) return next(new Error('已存在此角色!'));
			let result = await Role.create({ code, name });
			res.send(new Resp(1, '创建角色成功!', result));
		} catch (err) {
			log('red', err.stack);
			return next(new Error('创建角色出错'));
		}
	}

	// 修改角色
	async update(req, res, next) {
		let { id, code, name } = req.body;
		if (!id) return next(new Error('缺少角色id!'));
		try {
			let role = await Role.findOne({ _id: id });
			if (!role) return next(new Error('未找到此角色!'));
			if(role.code === 'root') return next(new Error('不允许修改root角色!'));
			if (code) role.code = code;
			if (name) role.name = name;
			let result = await role.save();
			initAcl();
			res.send(new Resp(1, '修改角色成功!', result));
		} catch (err) {
			log('red', err.stack);
			next(new Error('修改角色失败!'));
		};
	}
	// 删除角色
	async del(req, res, next) {
		let { ids } = req.body;
		if (!ids) return next(new Error('缺少角色id!'));
		if (!(ids instanceof Array)) ids = [ids];
		if (!validObjectId(ids)) return next(new Error('角色id格式错误!'));
		try {
			let containRoot = false;
			let roles = await Role.find({ _id: ids });
			if (roles.length === 0) return next(new Error('未找到任何角色!'));
			roles.forEach(item => containRoot = item.code === 'root' ? true : false);
			if(containRoot) return next(new Error('不允许修改root角色!'));
			let unCheckRoles = {};
			ids.forEach(id => {
				unCheckRoles[id] = true;
			});
			roles.forEach(role => {
				if (unCheckRoles[role._id]) {
					delete unCheckRoles[role._id];
				};
			});
			if (roles.length < ids.length) return next(new Error(`部分角色不存在(${Object.keys(unCheckRoles).join(',')})!`));
			let result = await Role.deleteMany({ _id: ids });
			if (result.ok === 1) {
				return res.send(new Resp(1, `删除角色成功!`, null));
			};
		} catch (err) {
			log('red', err.stack);
			return next(new Error('删除角色出错!'));
		}
	}

}

module.exports = new RoleCtrl();