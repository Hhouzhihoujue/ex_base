const { acl } = require('../config/acl');

const checkPermission = (resource, permission) => {
	return async (req, res, next) => {
		let role = (req.user && req.user.role) ? req.user.role.code : null;
		if(!role) return next(new Error('没有登陆!'));
		let result = await acl.areAnyRolesAllowed(role, resource, permission);
		if(!result) return next(new Error('没有权限!'));
		return next();
	};
};

module.exports = checkPermission;