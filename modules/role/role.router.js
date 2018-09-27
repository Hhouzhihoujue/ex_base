const RoleCtrl = require('./role.ctrl');
const checkUserInfo = require('../../middleware/checkUserInfo');
const checkPermission = require('../../middleware/checkPermission');
module.exports = (app) => {
	app.get('/roles', checkUserInfo, checkPermission('user', 'list_role'), RoleCtrl.list);
	app.post('/roles', checkUserInfo, checkPermission('user', 'create_role'), RoleCtrl.create);
	app.put('/roles', checkUserInfo, checkPermission('user', 'create_role'), RoleCtrl.update);
	app.delete('/roles', checkUserInfo, checkPermission('user', 'delete_role'), RoleCtrl.del);
};