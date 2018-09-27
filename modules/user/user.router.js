const UserCtrl = require('./user.ctrl');
const checkUserInfo = require('../../middleware/checkUserInfo');
const checkPermission = require('../../middleware/checkPermission');
module.exports = (app) => {
	app.get('/users', checkUserInfo, checkPermission('user', 'list_user'), UserCtrl.list);
	app.post('/users', checkUserInfo, checkPermission('user', 'create_user'), UserCtrl.create);
	app.put('/users', checkUserInfo, checkPermission('user', 'create_user'), UserCtrl.update);
	app.delete('/users', checkUserInfo, checkPermission('user', 'delete_user'), UserCtrl.del);
	app.post('/login', UserCtrl.login);
};