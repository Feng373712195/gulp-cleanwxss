const getClassAttr = (str) => {
  console.log(str, 'str');
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
    const attrContent = getClassAttr(attrSelect);
    if (/class=/.test(attrSelect)) {
      res.push(...nodes.filter(node => node.classStr === attrContent));
      console.log(attrContent);
    }
    if (/class~/.test(attrSelect)) {
      res.push(...nodes.filter(node => node.class.indexOf(attrSelect) !== -1));
      console.log(attrContent);
    }
    if (/class\|/.test(attrSelect)) {
      res.push(...nodes.filter(node => node.classStr === attrSelect || node.classStr.indexOf(`${attrSelect}-`) === 0));
      console.log(attrContent);
    }
    if (/class\^/.test(attrSelect)) {
      const regExp = new RegExp(`^${attrSelect.replace(/(-_)/g, '\\$1')}`);
      res.push(...nodes.filter(node => regExp.test(node.classStr)));
      console.log(attrContent);
    }
    if (/class\$/.test(attrSelect)) {
      const regExp = new RegExp(`${attrSelect.replace(/(-_)/g, '\\$1')}$`);
      res.push(...nodes.filter(node => regExp.test(node.classStr)));
      console.log(attrContent);
    }
    if (/class\*/.test(attrSelect)) {
      res.push(...nodes.filter(node => node.classStr.indexOf(attrSelect) !== -1));
      console.log(attrContent);
    }
  }

  return null;
}

module.exports = findNodeHasAttr;
