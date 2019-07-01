function getClassStr(tag) {
  const classKey = 'class';
  // 判断前面是否有空格 避免匹配到 *-class
  const hasClass = new RegExp('\\s+class\\=');
  if (hasClass.test(tag)) {
    // 获取class属性在标签的开始位置
    const startIndex = tag.search(new RegExp('class\\=[\\\'|\\"]'));
    // 判断开始是双引号还是单引号
    const startMark = tag.substr(startIndex + classKey.length + 1, 1);
    // 获得结束位置
    const endIndex = tag.substring(startIndex + classKey.length + 2, tag.length).indexOf(startMark);
    // 取得整段class
    const TagClassStr = tag.substring(startIndex, startIndex + endIndex + classKey.length + 3);
    const classContentReg = new RegExp(`class\\=\\${startMark}(.*)\\${startMark}`);
    const classContent = classContentReg.exec(TagClassStr)[1];
    return classContent;
  }
  return '';
}

module.exports = getClassStr;
