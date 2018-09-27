const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = new Schema({
	// 用户名
	username: String,
	// 密码
	password: String,
	// 昵称
	nickName: {
		type: String,
		default: '无名大侠'
	},
	// 角色
	role: {
		ref: 'Role',
		type: Schema.Types.ObjectId
	}
});
mongoose.model('User', User);