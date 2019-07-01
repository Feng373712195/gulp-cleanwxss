
// 取得标签名称
function getTagName(tag) {
  const tagExec = /<([\w|-]+)\s?|\/([\w|-]+)\s?>/.exec(tag);
  const tagName = tagExec[1] ? tagExec[1] : tagExec[2];
  return tagName;
}

module.exports = getTagName;
