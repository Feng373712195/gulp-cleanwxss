const setSelectNodeCache = require('./setSelectNodeCache');
const isObject = require('../util/isObject');
const isArray = require('../util/isArray');

// 浅拷贝函数
const shallow = (data) => {
  let o;
  if (isArray(data)) {
    o = [];
    data.forEach((val, index) => {
      if (isArray(val)) o[index] = [...val];
      else if (isObject(val)) o[index] = { ...val };
      else o[index] = val;
    });
  }
  if (isObject(data)) {
    o = {};
    Object.keys(data).forEach((key) => {
      if (isArray(data[key])) o[key] = [...data[key]];
      else if (isObject(data[key])) o[key] = { ...data[key] };
      else o[key] = data[key];
    });
  }
  return o;
};

// 拷贝wxmlTree
function cloneWxmlTree(nodes, parent = null, selectNode) {
  const clone = [];
  nodes.forEach((node) => {
    const nodeKey = Object.keys(node)[0];
    // 浅拷贝
    const cloneNode = shallow(node[nodeKey]);
    // 拷贝node指向新的parent
    cloneNode.parent = parent;
    if (cloneNode.childs.length) {
      // 把node的子node父级指向拷贝的node
      const cloneNodeParent = { key: nodeKey, obj: cloneNode };
      cloneNode.childs = cloneWxmlTree(cloneNode.childs, cloneNodeParent, selectNode);
    }
    if (selectNode) {
      setSelectNodeCache(cloneNode, cloneNode.class, cloneNode.id, selectNode);
    }
    clone.push({ [nodeKey]: cloneNode });
  });
  return clone;
}

module.exports = cloneWxmlTree;
