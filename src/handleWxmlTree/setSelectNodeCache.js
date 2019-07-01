// 存入节点缓存对象
function setSelectNodeCache(tag, classes, id, selectNodes) {
  // 避免用重复class元素
  if (classes.length) {
    classes.forEach((classname) => {
      if (!selectNodes[`.${classname}`]) {
        selectNodes[`.${classname}`] = [];
      }
      selectNodes[`.${classname}`].push(tag);
    });
  }
  // 避免有重复id元素
  if (id) {
    if (!selectNodes[`#${id}`]) {
      selectNodes[`#${id}`] = [];
    }
    selectNodes[`#${id}`].push(tag);
  }

  if (selectNodes.__tag__[tag.tag]) {
    selectNodes.__tag__[tag.tag].push(tag);
  } else {
    selectNodes.__tag__[tag.tag] = [tag];
  }

  if (selectNodes.nodes) {
    selectNodes.nodes.push(tag);
  } else {
    selectNodes.nodes = [tag];
  }
}

module.exports = setSelectNodeCache;
