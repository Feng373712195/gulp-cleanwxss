// 检查element1~element2选择器是否生效
function checkProgenySelectQuery(classSelect, findNodes = null) {
  const newFinds = [];
  if (findNodes) {
    const progenySelectType = classSelect[0] == '#' ? 'id' : classSelect[0] == '.' ? 'class' : 'tag';
    findNodes.nodes.forEach((node, index) => {
      // 获取父级内的所有同级元素
      const brothers = Object.values(node.parent.obj.childs).map((n, key) => Object.values(n)[0]);
      //  找到自己在同级元素中的开始标签索引位置
      const selfIndex = brothers.indexOf(node);
      // 寻找此标签闭合后下一个的索引
      // let otherBrotherNodeStartIndex = findCloseTagIndex(brothers,node)
      // 得到闭合标签后的所有元素
      const otherBrotherNode = brothers.slice(0, selfIndex);
      // 寻找 相领选择器 对应元素
      if (otherBrotherNode.length > 0) {
        otherBrotherNode.reverse().forEach((node) => {
          const progenyNodeSelect = progenySelectType != 'tag' ? classSelect.slice(1) : classSelect;
          if (progenySelectType == 'id' && node.id == progenyNodeSelect) newFinds.push(node);
          else if (progenySelectType == 'class' && ~node.class.indexOf(progenyNodeSelect)) newFinds.push(node);
          else if (progenySelectType == 'tag' && node.tag == secondSelect) newFinds.push(node);
        });
      }
    });
  } else {
    console.err('checkProgenySelectQuery not findNodes');
  }
  return newFinds;
}

module.exports = checkProgenySelectQuery;
