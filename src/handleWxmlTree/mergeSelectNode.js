// 合并两个selectNode
// 把nodes2合并入nodes1 最终返回nodes1
export default (nodes1, nodes2) => {
  const resNodes = nodes1;
  const node2Keys = Object.keys(nodes2);
  node2Keys.forEach((key) => {
    if (key !== 'tag') {
      if (nodes1[key]) {
        resNodes[key] = nodes1[key].concat(nodes2[key]);
      } else {
        resNodes[key] = nodes2[key];
      }
    }
  });
  const node2TagKeys = Object.keys(nodes2.tag);
  node2TagKeys.forEach((key) => {
    if (nodes1.tag[key]) {
      resNodes.tag[key] = nodes1.tag[key].concat(nodes2.tag[key]);
    } else {
      resNodes.tag[key] = nodes2.tag[key];
    }
  });
  return resNodes;
};
