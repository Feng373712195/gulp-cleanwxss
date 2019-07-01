// 判断是否为对象类型
const isObject = obj => typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Object]';

module.exports = isObject;
