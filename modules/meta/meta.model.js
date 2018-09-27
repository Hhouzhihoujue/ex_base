const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Meta = new Schema({
	// 分组
	resource: String,
	resource_des: String,
	// 权限
	permission: String,
	permission_des: String,
	roles: [{
		type: Schema.Types.ObjectId,
		ref: 'Role'
	}]
});
mongoose.model('Meta', Meta);