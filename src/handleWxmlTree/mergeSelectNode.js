// 合并两个selectNode
// 把nodes2合并入nodes1 最终返回nodes1
function mergeSelectNode(nodes1, nodes2) {
  const resNodes = nodes1;
  const node2Keys = Object.keys(nodes2);
  node2Keys.forEach((key) => {
    if (key !== '__tag__') {
      if (nodes1[key]) {
        resNodes[key] = nodes1[key].concat(nodes2[key]);
      } else {
        resNodes[key] = nodes2[key];
      }
    }
  });
  const node2TagKeys = Object.keys(nodes2.__tag__);
  node2TagKeys.forEach((key) => {
    if (nodes1.__tag__[key]) {
      resNodes.__tag__[key] = nodes1.__tag__[key].concat(nodes2.__tag__[key]);
    } else {
      resNodes.__tag__[key] = nodes2.__tag__[key];
    }
  });
  return resNodes;
}

module.exports = mergeSelectNode;
