const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { globPath, log, logger } = require('./utils');
const env = require('./env');
const { initAcl } = require('./acl');
require('./mongoose');
require('./redis');

class App {
	constructor(express) {
		this.app = express();
		this.start();
	}
	async start() {
		this.app.use(morgan('short'));
		this.app.use(bodyParser.urlencoded({
			extended: true,
			limit: '32mb'
		}));
		this.app.use(bodyParser.json({
			limit: '32mb'
		}));
		this.app.use(cors());
		this.app.use(this.logRequest);
		await this.loadModel();
		await this.initRouter();
		await initAcl();
		this.app.use(this.handleRequest);
		this.app.use(this.handleError);
		await this.listen(env.port);
	}
	async initRouter() {
		let files = await globPath('../modules/*/*.router.js');
		files.forEach(async file => {
			await require(file)(this.app);
		});
		log('blue', 'Router 初始化完成!');
	}
	async loadModel() {
		let files = await globPath('../modules/*/*.model.js');
		files.forEach(file => {
			require(file);
		});
		log('blue', 'Model 初始化完成!');
		const User = mongoose.model('User');
		const Role = mongoose.model('Role');
		let info = await Promise.all([
			User.findOne({ username: env.rootUser.username }),
			Role.findOne({ code: env.rootUser.roleCode })
		]);
		if (!info[0] || !info[1]) {
			let role, user;
			try {
				role = await Role.create({
					name: env.rootUser.roleName,
					code: env.rootUser.roleCode
				});
			} catch (err) {
				logger('error', err.stack);
			};
			try {
				user = await User.create({
					username: env.rootUser.username,
					password: env.rootUser.password,
					role: role._id,
					nickName: env.rootUser.roleName
				});
			} catch (err) {
				logger('error', err.stack);
			};
			log('blue', '超级管理员初始化完成!');
		};
	}
	logRequest(req, res, next) {
		const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
		const body = JSON.stringify(req.body) === '{}' ? '' : ' [body] ' + JSON.stringify(req.body);
		const params = JSON.stringify(req.params) === '{}' ? '' : ' [params] ' + JSON.stringify(req.params);
		const query = JSON.stringify(req.query) === '{}' ? '' : ' [query] ' + JSON.stringify(req.query);
		logger('request', `${ip} ${req.path}${body + params + query}`);
		next()
	}
	handleRequest(req, res, next) {
		res.status(404).json({
			code: 0,
			msg: 'Not Found!',
			data: null
		})
	}
	handleError(err, req, res, next) {
		res.send({
			code: 0,
			msg: err.message || '系统错误!',
			data: null
		});
	}
	listen(port) {
		this.app.listen(port, () => {
			log('blue', `Server is running on ${port}!`);
		});
	}
}

module.exports = App;


