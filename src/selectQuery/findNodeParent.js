
// 是否有同级选择器正则表达式 如： .a.b .a#b
const peerSelectReg = /(?=\.)|(?=#)/g;
// 寻找子元素的父级元素
function findNodeParent(node, select, deep = 9999) {
  --deep;
  // 已经到达root节点 寻找不到节点
  if (node.parent.key == 'root') return null;

  const peerSelect = select.split(peerSelectReg);
  if (peerSelect.length > 1) {
    const finds = [];
    peerSelect.forEach((v1) => {
      // 注意这里要区分id 和 class
      if (v1[0] == '.') {
        finds.push(node.parent.obj.class.findIndex(v2 => `.${v2}` == v1));
      } else if (v1[1] == '#') {
        finds.push(node.parent.obj.id == v1);
      } else {
        finds.push(node.parent.obj.tag == v1);
      }
    });
    const isParent = finds.every(v => v != -1);
    if (deep == 0) {
      return isParent ? node.parent.obj : null;
    }
    return isParent ? node.parent.obj
      : _findNodeParent(node.parent.obj, select);
  }
  let isParent = false;

  if (select[0] == '.') {
    isParent = node.parent.obj.class.findIndex(v2 => `.${v2}` == select) != -1;
  } else if (select[1] == '#') {
    isParent = node.parent.obj.id == select;
  } else {
    isParent = node.parent.obj.tag ? node.parent.obj.tag == select : false;
  }

  if (deep == 0) {
    return isParent ? node.parent.obj : null;
  }
  return isParent ? node.parent.obj
    : _findNodeParent(node.parent.obj, select);
}

module.exports = findNodeParent;
