// 寻找元素里面是否含有指定标签
function findNodeHasTag(node, select, deep = 9999) {
  --deep;
  for (let i = 0, len = node.childs.length; i < len; i++) {
    const key = Object.keys(node.childs[i]);

    if (select[0] == '.' && node.childs[i][key].class.indexOf(select.slice(1)) != -1
            || select[0] == '#' && node.childs[i][key].id == select.slice(1)
            || node.childs[i][key].tag == select) {
      return true;
    }
    if (deep == 0) return false;
    if (findNodeHasTag(node.childs[i][key], select)) return true;
  }
  return false;
}

module.exports = findNodeHasTag;
