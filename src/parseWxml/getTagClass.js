const getDynamicClass = require('./getDynamicClass');
const getTernaryExpressionClass = require('./getTernaryExpressionClass');

// 是否为三元表达式
const ternaryExpressionReg = /(.*?)\?(.*):(.*)/;

// 是否为模版渲染class
const isDynamicReg = /{{.*}}/g;

// 是否为拼接class
const joinLeftClassReg = /([-_\w]+)\{\{(.*?)\}\}/;
const joinRightClassReg = /\{\{(.*?)\}\}([-_\w]+)/;

// 是否字符串正则表达式
const isStringReg = /['|"](.*?)['|"]/;

// 取得标签内的Class
// 注意还有hover-class 之类的情况
function getTagClass(classKey, tag, cssVariable, arr) {
  let TagClass = arr || [];

  // 判断前面是否有空格 避免匹配到 *-class
  const hasClass = new RegExp(`\\s+${classKey}\\=`);

  // 判断标签是否拥有class
  if (hasClass.test(tag)) {
    // 获取class属性在标签的开始位置
    const startIndex = tag.search(new RegExp(`${classKey}\\=[\\'|\\"]`));
    // 判断开始是双引号还是单引号
    const startMark = tag.substr(startIndex + classKey.length + 1, 1);
    // 获得结束位置
    const endIndex = tag.substring(startIndex + classKey.length + 2, tag.length).indexOf(startMark);
    // 取得整段class
    const TagClassStr = tag.substring(startIndex, startIndex + endIndex + classKey.length + 3);

    const classContentReg = new RegExp(`${classKey}\\=\\${startMark}(.*)\\${startMark}`);
    let classContent = classContentReg.exec(TagClassStr)[1];
    classContent = classContent.replace(isDynamicReg, $1 => $1.replace(/\s/g, ''));
    const classContentSlice = classContent.split(' ');
    classContentSlice.forEach((slice) => {
      if (isDynamicReg.test(slice)) {
        if (joinLeftClassReg.test(slice) || joinRightClassReg.test(slice)) {
          slice = slice.replace(/(\{\{|\}\})/g, $1 => ($1[0] === '{' ? ` ${$1}` : `${$1} `));
          slice = slice.split(' ')
            .map(item => (isDynamicReg.test(item) ? item.replace(/(\{\{|\}\})/g, '').replace(isStringReg, '$1') : `"${item}"`))
            .join(' + ');
          const res = getDynamicClass(slice, cssVariable);
          TagClass = TagClass.concat(res);
        } else if (ternaryExpressionReg.test(slice)) {
          const res = getTernaryExpressionClass(slice, cssVariable);
          TagClass = TagClass.concat(res);
        } else {
          const res = getDynamicClass(slice, cssVariable);
          TagClass = TagClass.concat(res);
        }
      } else if (slice) {
        TagClass.push(slice);
      }
    });

    console.log(TagClass, 'TagClass');


    // OLD
    // 获取动态选人的class
    // const dynamicClassReg = /([-_\w]+)?\{\{(.*?)\}\}([-_\w]+)?/;
    // const dynamicClass = '';
    // while (dynamicClass = dynamicClassReg.exec(TagClassStr)) {
    // if (ternaryExpressionReg.test(dynamicClass[2])) {
    //   let res = getTernaryExpressionClass(dynamicClass[2], cssVariable);
    //   res = res.map(className => `${dynamicClass[1] ? dynamicClass[1] : ''}${className}${dynamicClass[3] ? dynamicClass[3] : ''}`);
    //   TagClass = TagClass.concat(res);
    // } else if (dynamicClass[2] != '') {
    //   dynamicClass[2] = dynamicClass[2].trimLeft().trimRight();
    //   let res = getDynamicClass(dynamicClass[2], cssVariable);
    //   res = res.map(className => `${dynamicClass[1] ? dynamicClass[1] : ''}${className}${dynamicClass[3] ? dynamicClass[3] : ''}`);
    //   TagClass = TagClass.concat(res);
    // if (!isStringReg.test(dynamicClass[2])) {
    // _cssVariable.add(dynamicClass[2]);
    // }
    // }
    // TagClassStr = TagClassStr.replace(dynamicClass[0], '');
    // }
    // TagClassStr.replace(new RegExp(`${classKey}\\=[\\'|\\"](.*)[\\'|\\"]`), (classStr, classNames) => {
    //   TagClass = TagClass.concat(classNames.split(' ').filter(v => v));
    // });

    // 一些写法不规范的开发者 会写多个class 这里先不管
    tag = tag.replace(classContentReg, '');
    if (hasClass.test(tag)) {
      return getTagClass(classKey, tag, cssVariable, TagClass);
    }
  }

  return TagClass;
}

module.exports = getTagClass;
