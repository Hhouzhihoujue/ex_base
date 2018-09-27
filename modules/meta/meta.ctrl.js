const mongoose = require('mongoose');
const Meta = mongoose.model('Meta');
const { initAcl } = require('../../config/acl');
const { log, Resp, validObjectId } = require('../../config/utils');
class MetaCtrl {
	// 权限列表
	async list(req, res, next) {
		try {	
			let metas = await Meta.find({}).populate('roles');
			res.send(new Resp(1, '查询权限成功!', metas));
		} catch (err) {
			log('red', err.stack);
			next(new Error('查询权限出错!'));
		}
	}
	// 创建权限
	async create(req, res, next) {
		let { resource, permission, roles, resource_des, permission_des} = req.body;
		if(!resource) return next(new Error('缺少参数: resource!'));
		if(!permission) return next(new Error('缺少参数: permission!'));
		if(!resource_des) return next(new Error('缺少参数: resource_des!'));
		if(!permission_des) return next(new Error('缺少参数: permission_des!'));
		if(!roles) return next(new Error('缺少参数: roles!'));
		if(!(roles instanceof Array)) roles = [roles];
		try {
			let oldMeta = await Meta.findOne({ resource, permission, roles});
			if(oldMeta) return next(new Error('此权限已存在!'));
			let meta = await Meta.create({resource, permission, roles, resource_des, permission_des})
			initAcl();
			res.send(new Resp(1, '创建权限成功!', meta));
		} catch (err) {
			log('red', err.stack);
			next(new Error('创建权限失败!'))
		}
	}
	// 修改权限
	async update(req, res, next) {
		let { id, resource, permission, roles, resource_des, permission_des} = req.body;
		if(!id) return next(new Error('缺少权限id!'));
		try {
			let meta = await Meta.findOne({ _id: id});
			if(!meta) return next(new Error('未找到此权限!'));
			if(resource) meta.resource = resource;
			if(permission) meta.permission = permission;
			if(resource_des) meta.resource_des = resource_des;
			if(permission_des) meta.permission_des = permission_des;
			if(roles) meta.roles = (roles instanceof Array) ? roles : [roles];
			let result = await meta.save();
			initAcl();
			res.send(new Resp(1, '修改权限成功!', result));
		} catch (err) {
			log('red', err.stack);
			next(new Error('创建权限失败!'))
		}
	}
	// 删除权限
	async del(req, res, next) {
		let { ids } = req.body;
		if (!ids) return next(new Error('缺少权限id!'));
		if(!(ids instanceof Array)) ids = [ids];
		if(!validObjectId(ids)) return next(new Error('权限id格式错误!'));
		try {
			let metas = await Meta.find({ _id: ids });
			if(metas.length === 0) return next(new Error('未找到任何权限!'));
			let unCheckMetas = {};
			ids.forEach(id => {
				unCheckMetas[id] = true;
			});
			metas.forEach(meta => {
				if(unCheckMetas[meta._id]) {
					delete unCheckMetas[meta._id]
				};
			});
			if(metas.length < ids.length) return next(new Error(`部分权限不存在(${Object.keys(unCheckMetas).join(',')})!`));
			let result = await Meta.deleteMany({_id: ids});
			if(result.ok === 1) {
				return res.send(new Resp(1, `删除权限成功!`, null));
			};
		} catch (err) {
			log('red', err.stack);
			return next(new Error('删除权限出错!'));
		}
	}

}

module.exports = new MetaCtrl();