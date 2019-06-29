const peerSelectReg = /(?=\.)|(?=#)/g;

// 检查相邻兄弟选择器是否生效
function checkAdjacentSelectQuery(classSelect, findNodes = null) {
  const newFinds = [];
  if (findNodes) {
    const peerSelect = classSelect
      .split(peerSelectReg)
      .map(item => (item !== 'tag' ? item.slice(1) : item));

    findNodes.nodes.forEach((node) => {
      // 获取父级内的所有同级元素
      const brothers = Object.values(node.parent.obj.childs).map(n => Object.values(n)[0]);
      //  找到自己在同级元素中的开始标签索引位置
      const selfIndex = brothers.indexOf(node);
      // 寻找此标签闭合后下一个的索引
      // let otherBrotherNodeStartIndex = findCloseTagIndex(brothers,node)
      // 得到闭合标签后的所有元素
      const otherBrotherNode = brothers.slice(0, selfIndex);
      // 寻找 相领选择器 对应元素
      if (otherBrotherNode.length > 0) {
        const brotherNode = otherBrotherNode.reverse().find(node => (node.statrTag && node.endTag) || node.statrTag);
        const isBrotherNode = peerSelect.every((select) => {
          if (brotherNode.id === select) return true;
          if (~brotherNode.class.indexOf(select)) return true;
          if (brotherNode.tag === select) return true;
          return false;
        });
        if (isBrotherNode) newFinds.push(brotherNode);
      }
    });
  } else {
    console.err('checkAdjacentSelectQuery not findNodes');
  }

  return newFinds;
}

module.exports = checkAdjacentSelectQuery;
