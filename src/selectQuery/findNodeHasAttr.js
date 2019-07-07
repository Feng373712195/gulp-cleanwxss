// 是否字符串正则表达式
const isStringReg = /['|"](.*?)['|"]/;

const getClassAttr = (str) => {
  let match = null;
  if (match = /class.?=(.*)/.exec(str)) {
    return match[1];
  }
  return match;
};

function findNodeHasAttr(select, nodes) {
  const res = [];
  const attrSelect = /\[(.*)\]/.exec(select)[1];
  // 暂时只支持class属性选择器
  if (/^class/.test(attrSelect)) {
    if (select === '[class]') {
      res.push(...nodes.filter(node => node.classStr !== ''));
      return res;
    }
    let attrContent = getClassAttr(attrSelect);
    attrContent = attrContent.replace(isStringReg, '$1');

    if (/class=/.test(attrSelect)) {
      res.push(...nodes.filter(node => node.classStr === attrContent));
    }
    if (/class~/.test(attrSelect)) {
      res.push(...nodes.filter(node => node.class.indexOf(attrContent) !== -1));
    }
    if (/class\|/.test(attrSelect)) {
      res.push(...nodes.filter(node => node.classStr === attrContent || node.classStr.indexOf(`${attrContent}-`) === 0));
    }
    if (/class\^/.test(attrSelect)) {
      const regExp = new RegExp(`^${attrContent.replace(/(-_)/g, '\\$1')}`);
      res.push(...nodes.filter(node => regExp.test(node.classStr)));
    }
    if (/class\$/.test(attrSelect)) {
      const regExp = new RegExp(`${attrContent.replace(/(-_)/g, '\\$1')}$`);
      res.push(...nodes.filter(node => regExp.test(node.classStr)));
    }
    if (/class\*/.test(attrSelect)) {
      res.push(...nodes.filter(node => node.classStr.indexOf(attrContent) !== -1));
    }
  }

  return res.length === 0 ? null : res;
}

module.exports = findNodeHasAttr;
