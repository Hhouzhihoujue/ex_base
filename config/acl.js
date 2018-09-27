const AcL = require('acl');
const mongoose = require('mongoose');
const { log } = require('./utils');
const env = require('./env');
const acl = new AcL(new AcL.memoryBackend());
// 初始化权限
// acl.allow([
// 	{
// 		roles:['guest', 'member'],
// 		allows:[
// 			{resources:'blogs', permissions:'get'},
// 			{resources:['forums', 'news'], permissions:['get', 'put', 'delete']}
// 		]
// 	},
// 	{
// 		roles:['gold', 'silver'],
// 		allows:[
// 			{resources:'cash', permissions:['sell', 'exchange']},
// 			{resources:['account', 'deposit'], permissions:['put', 'delete']}
// 		]
// 	}
// ]);

const initAcl = async () => {
	const Meta = mongoose.model('Meta');
	const Role = mongoose.model('Role');
	let [metas, roles] = [null, null];
	try {
		[metas, roles] = await Promise.all([Meta.find({}), Role.find({})]);
	} catch (err) {
		log('red', `[初始化权限]查询权限或角色出错：${err}`);
	}
	let roleObj = {};
	let permissions = [];
	roles.forEach(item => {
		roleObj[item._id] = {
			code: item.code,
			data: []
		};
	});
	metas.forEach(item => {
		let roles = item.roles;
		roles.forEach(im => {
			roleObj[im].data.push({
				resources: item.resource,
				permissions: item.permission
			});
		});
    
	});
	Object.keys(roleObj).forEach(role => {
		permissions.push({
			roles: [roleObj[role].code, env.rootUser.roleCode],
			allows: roleObj[role].data
		});
	});  
	acl.allow(permissions);
};

module.exports = {
	acl,
	initAcl
};