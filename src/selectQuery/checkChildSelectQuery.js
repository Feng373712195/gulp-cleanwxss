const findNodeParent = require('./findNodeParent');
// 检查兄弟选择器是否生效
function checkChildSelectQyery(classSelects, findNodes = null) {
  let newFinds = [];

  findNodes.nodes.forEach((node) => {
    newFinds = newFinds.concat(findNodeParent(node, classSelects, 1));
  });

  const finds = newFinds.filter(v => v);
  if (finds.length === 0) {
    return [];
  }
  return finds;
}

module.exports = checkChildSelectQyery;
