module.exports = {
	port: 3000,
	mongo: {
		url: 'mongodb://127.0.0.1:27017',
		params: {
			dbName: 'ex_test',
			useNewUrlParser: true
		}
	},
	redis: {
		host: '127.0.0.1',
		port: 6379
	},
	JWT_secret: 'ex_test',
	redisKey: {
		userLoginInfo: 'user_login_info'
	},
	rootUser: {
		username: 'root',
		password: 'root123',
		roleCode: 'root',
		roleName: '超级管理员'
	}
};