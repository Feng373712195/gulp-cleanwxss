const selectMap = {};
// 伪元素伪类匹配正则表达式
const pseudoClassReg = /\:link|\:visited|\:active|\:hover|\:focus|\:before|\:\:before|\:after|\:\:after|\:first-letter|\:first-line|\:first-child|\:lang\(.*\)|\:lang|\:first-of-type|\:last-of-type|\:only-child|:nth-child\(.*\)|:nth-last-child\(.*\)|\:nth-of-type\(.*\)|\:nth-last-of-type\(.*\)|\:last-child|\:root|\:empty|\:target|\:enabled|\:disabled|\:checked|\:not\(.*\)|\:\:selection/g;
// 是否有同级选择器正则表达式 如： .a.b .a#b
const peerSelectReg = /(?=\.)|(?=\#)/g;
// 是否带有特殊选择器
const hasSelectorReg = /(\~|\+|\>)/;

// .wenwen-block .ask-list .ask-item .reward ~ text
const PAGE_DIR_PATH = '/test';
// const PAGE_DIR_PATH = '/video'
// const PAGE_DIR_PATH = '/test'
// 用来收集css变量 开发时使用
const _cssVariable = new Set();

// 未来 config 参数
const cssVariable = {};
// 未来 config 参数
const componentsClasses = {};


export default async (file) => {
  const pageFilePath = path.join(PAGES_PATH, PAGE_DIR_PATH);
  const pageFiles = await fsp.readdir(pageFilePath, 'utf-8');

  let pageWxss = await fsp.readFile(path.join(pageFilePath, pageFiles.find(v => /\.wxss/.test(v))), 'utf-8');
  const pageWxml = await fsp.readFile(path.join(pageFilePath, pageFiles.find(v => /\.wxml/.test(v))), 'utf-8');
  const pageJson = await fsp.readFile(path.join(pageFilePath, pageFiles.find(v => /\.json/.test(v))), 'utf-8');

  pageWxss = await getWxss(pageWxss);

  // 获取Wxss中的选择器
  const classSelects = [];
  // 获取clss id 标签选择器
  pageWxss.replace(/([\.|\#|\w+].*)\{/g, ($1, $2) => {
    classSelects.push($2);
  });

  // 获取Wxml树
  const { WxmlTree, selectNodeCache } = await getWxmlTree({ pageWxml, pageJson });

  console.log(_cssVariable, '_cssVariable');

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
      that.select = separateClassSelect.some(classSelect => checkSelectQuery(classSelect));
    } else {
      that.select = checkSelectQuery(classSelects[i]);
    }
  }

  // 检查没有被选中的元素
  for (const x in selectMap) {
    !selectMap[x].select && console.log(x, selectMap[x]);
  }
};
