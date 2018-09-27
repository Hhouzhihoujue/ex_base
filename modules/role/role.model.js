const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Role = new Schema({
	//角色代码
	code: String,
	//角色名称
	name: String
});

mongoose.model('Role', Role);