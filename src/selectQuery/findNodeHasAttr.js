const getClassAttr = str => /\class.\=(.*)/.exec(str)[1];

function findNodeHasAttr(select, nodes) {
  console.log('========= findNodeHasAttr ========', select);
  console.log('nodes', nodes.length);
  const res = [];
  const attrContent = /\[(.*)\]/.exec(select)[1];
  // 暂时只支持class属性选择器
  if (/^class/.test(select)) {
    if (select === '[class]') return nodes;
    if (/class=/.test(select)) {
      console.log('1111');
      getClassAttr(select);
    }
    if (/class~/.test(select)) {
      console.log('2222');
      getClassAttr(select);
    }
    if (/class\|/.test(select)) {
      console.log('3333');
      getClassAttr(select);
    }
    if (/class\^/.test(select)) {
      console.log('4444');
      getClassAttr(select);
    }
    if (/class\$/.test(select)) {
      console.log('5555');
      getClassAttr(select);
    }
    if (/class\*/.test(select)) {
      console.log('6666');
      getClassAttr(select);
    }
  }

  return null;
}

module.exports = findNodeHasAttr;
