
// 取得标签名称
export default (tag) => {
  const tagExec = /<([\w|-]+)\s?|\/([\w|-]+)\s?>/.exec(tag);
  // console.log( tag,'=== tag ===' )
  const tagName = tagExec[1] ? tagExec[1] : tagExec[2];
  return tagName;
};
