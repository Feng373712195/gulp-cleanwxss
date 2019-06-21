const through = require('through2');
const path = require('path');
const fsp = require('fs-promise');

const getWxss = require('./parseWxss/getWxss');
const getWxmlTree = require('./handleWxmlTree/getWxmlTree');
const checkSelectQuery = require('./selectQuery/checkSelectQuery');

const selectMap = {};

// 用来收集css变量 开发时使用
const _cssVariable = new Set();

module.exports = function (...arg) {
  console.log(arg);

  const stream = through.obj(async function (file, enc, cb) {
    // console.log('==================================');
    // console.log(file.cwd, 'file.cwd');
    // console.log(file.base, 'file.base');
    // console.log(file.path, 'file.path');
    // console.log(file.relative, 'relative');
    // console.log(file.dirname, 'file.dirname');
    // console.log(file.stem, 'stem');
    // console.log(file.extname, 'extname');

    console.log(path.join(file.base, `/${file.stem}.json`));

    let pageWxss = String(file.contents);
    const pageWxml = await fsp.readFile(path.join(file.base, `/${file.stem}.wxml`), 'utf-8');
    const pageJson = await fsp.readFile(path.join(file.base, `/${file.stem}.json`), 'utf-8');
    pageWxss = await getWxss(pageWxss, file.cwd, file.base);

    // 获取Wxss中的选择器
    const classSelects = [];
    // 获取clss id 标签选择器
    pageWxss.replace(/([.|#|\w+].*)\{/g, ($1, $2) => {
      classSelects.push($2);
    });

    // 获取Wxml树
    const { WxmlTree, selectNodeCache } = await getWxmlTree({ pageWxml, pageJson }, file.cwd, file.base);

    // 从子节点开始查找
    for (let i = 0, len = classSelects.length; i < len; i++) {
      // 存入selectMap
      selectMap[classSelects[i]] = { };
      const that = selectMap[classSelects[i]];

      // Page选择器 特殊处理
      if (classSelects[i].match(/^page/i)) {
        that.select = true;
        continue;
      }

      // 是否为逗号分隔
      const separateClassSelect = classSelects[i].split(',');
      // 有逗号分隔的选择器 其中一项有被使用就返回true
      // 注意: 可以优化 在最后制作弹出的HTML 显示哪些被动 哪些没用 可以让使用者删除更多无用代码
      if (separateClassSelect.length > 1) {
        that.select = separateClassSelect.some(classSelect => checkSelectQuery(classSelect, selectNodeCache));
      } else {
        that.select = checkSelectQuery(classSelects[i], selectNodeCache);
      }
    }

    // 检查没有被选中的元素
    for (const x in selectMap) {
      !selectMap[x].select && console.log(x, selectMap[x]);
    }

    this.push(file);
    cb();
  });

  return stream;
};
