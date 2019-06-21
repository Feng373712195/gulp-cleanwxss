// 取得标签内的id
function getId(tag) {
  // 判断前面是否有空格 避免匹配到 *-class
  const hasId = /\s+id=/;
  if (hasId.test(tag)) {
    // 获取id属性在标签的开始位置
    const startIndex = tag.search(/id=['|"]/);
    // 判断开始是双引号还是单引号
    const startMark = tag.substr(startIndex + 3, 1);
    // 获得结束位置
    const endIndex = tag.substring(startIndex + 4, tag.length).indexOf(startMark);
    // 取得整段id
    const TagIdStr = tag.substring(startIndex, startIndex + endIndex + 5);

    return TagIdStr.replace(/id=['|"](.*)['|"]/, '$1');
  }

  return '';
}

module.exports = getId;
