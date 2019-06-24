// 判断是否为数组类型
const isArray = obj => ([].isArray && [].isArray(obj)) || Object.prototype.toString.call(obj) === '[object Array]';

module.exports = isArray;
