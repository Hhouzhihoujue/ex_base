const jwt = require('jsonwebtoken');
const moment = require('moment');
const redis = require('../config/redis');
const { JWT_secret, redisKey, log } = require('../config/env');

const checkUserInfo = async (req, res, next) => {
  const { vf } = req.headers;
  if(!vf) return next(new Error('缺少验证参数!'));
  try {
    let result = jwt.verify(vf, JWT_secret);
    if(!result._id) {
      return next(new Error('验证失败!'));
    };
    redis.hget(redisKey.userLoginInfo, result._id, (err, info) => {
      if(err) {
        log('red', `读取redis错误: ${err}`);
        return next(new Error('读取redis错误!'));
      } 
      if(!info) return next(new Error('用户未登陆!'));
      if(info !== vf) return next(new Error('用户已在别处登陆!'));
      if(result.t_exp < moment().valueOf() / 1000) {
        redis.hdel(redisKey.userLoginInfo, result._id, err => {
          if(err) log('red', `清除redis中用户信息失败：${err}`);
          return next(new Error('用户验证已过期!'));
        });
      }else {
        req.user = result;
        next();
      };
    });
  } catch (err) {
    log('red', `验证token错误: ${err}`);
    return next(new Error('验证失败!'));
  }  
};

module.exports = checkUserInfo;