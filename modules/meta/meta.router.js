const MetaCtrl = require('./meta.ctrl');
const checkUserInfo = require('../../middleware/checkUserInfo');
const checkPermission = require('../../middleware/checkPermission');
module.exports = (app) => {
	app.get('/metas', checkUserInfo, checkPermission('user', 'list_meta'), MetaCtrl.list);
	app.post('/metas', checkUserInfo, checkPermission('user', 'create_meta') , MetaCtrl.create);
	app.put('/metas', checkUserInfo, checkPermission('user', 'create_meta'), MetaCtrl.update);
	app.delete('/metas', checkUserInfo, checkPermission('user', 'delete_meta') , MetaCtrl.del);
};