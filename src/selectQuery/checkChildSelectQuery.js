// 检查兄弟选择器是否生效
export default (classSelects, findNodes = null) => {
  const newFinds = [];

  findNodes.nodes.forEach((node) => {
    newFinds.push(_findNodeParent(node, classSelects, 1));
  });

  const finds = newFinds.filter(v => v);
  if (finds.length == 0) {
    return [];
  }
  return finds;
};
