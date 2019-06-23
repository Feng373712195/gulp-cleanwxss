const through = require('through2');
const gulpUtil = require('gulp-util');
const path = require('path');
const fsp = require('fs-promise');

const PLUGIN_NAME = 'gulp-clearwxss';
const { PluginError } = gulpUtil;

const getWxss = require('./parseWxss/getWxss');
const getWxmlTree = require('./handleWxmlTree/getWxmlTree');
const checkSelectQuery = require('./selectQuery/checkSelectQuery');

function cleanWxss(options = {}) {
  const stream = through.obj(async function (file, enc, cb) {
    if (file.isNull()) {
      return cb();
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
      return cb();
    }

    const selectMap = {};
    // 微信文件夹根目录 如果没有传的话 默认使用调用gulp的目录
    const wxminiProgramRootPath = options.wxRootPath ? options.wxRootPath : file.cwd;

    let pageWxss = String(file.contents);
    const pageWxml = await fsp.readFile(path.join(file.dirname, `/${file.stem}.wxml`), 'utf-8');
    const pageJson = await fsp.readFile(path.join(file.dirname, `/${file.stem}.json`), 'utf-8');
    pageWxss = await getWxss(pageWxss, wxminiProgramRootPath, file.dirname);

    // 获取Wxss中的选择器
    const classSelects = [];
    // 获取clss id 标签选择器
    pageWxss.replace(/([.|#|\w+].*)\{/g, ($1, $2) => {
      classSelects.push($2);
    });

    // 获取Wxml树
    const { WxmlTree, selectNodeCache } = await getWxmlTree({ pageWxml, pageJson }, options, wxminiProgramRootPath, file.dirname);

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

    let result = pageWxss;
    // 检查没有被选中的元素
    Object.keys(selectMap).forEach((key) => {
      if (!selectMap[key].select) {
        const classSelectStr = key.replace(/(\.|#|~|\[|\]|\^|=|\$|"|'|:|\(|\)|_)/g, '\\$1');
        const ReplaceRegex = new RegExp(`\\s?${classSelectStr}\\s?\\{([\\s\\S]*?)\n?\\}`, 'g');
        result = result.replace(ReplaceRegex, '');
      }
    });

    file.contents = Buffer.from(result);
    this.push(file);
    cb();
  });

  return stream;
}

module.exports = cleanWxss;
