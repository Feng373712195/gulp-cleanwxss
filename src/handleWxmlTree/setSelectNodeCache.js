// 存入节点缓存对象
export default (tag, classes, id, selectNodes) => {
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

  if (selectNodes.tag[tag.tag]) {
    selectNodes.tag[tag.tag].push(tag);
  } else {
    selectNodes.tag[tag.tag] = [tag];
  }
};
