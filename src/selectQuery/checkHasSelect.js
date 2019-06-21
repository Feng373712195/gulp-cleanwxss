// 是否有同级选择器正则表达式 如： .a.b .a#b
const peerSelectReg = /(?=\.)|(?=#)/g;
// 检查同级元素
function checkHasSelect(select, selectNodeCache) {
  const peerSelect = select.split(peerSelectReg);
  const firstSelect = !/^\.|^#/.test(peerSelect[0]) ? selectNodeCache.__tag__[peerSelect[0]] : selectNodeCache[peerSelect[0]];
  // peerSelect 大于 1 则为拥有同级选择器 如：.a.b
  if (peerSelect.length > 1) {
    // 判断同级的第一个选择器在页面中有没有元素使用
    if (firstSelect) {
      const otherPeerSelects = peerSelect.slice(1, peerSelect.length);
      // 匹配到的元素 推入这个数组
      let matchNodes = firstSelect.concat();
      return matchNodes = matchNodes.filter(node => otherPeerSelects.some((select) => {
        // 如果是class
        if (select[0] == '.') {
          return node.class.indexOf(select.slice(1)) != -1;
          // 如果是id
        } if (select[0] == '#') {
          return node.id == select.slice(1);
          // 如果是标签
        }
        //    return _findNodeHasTag(node,select)
        return node.tag == select;
      }));
    }
    return null;
  }
  return firstSelect || null;
}

module.exports = checkHasSelect;
