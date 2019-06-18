import getWxmlTree from './getWxmlTree';

// 把Wxml字符串转为树结构
export default async function getTemplateWxmlTree(temkey, wxmlStr, selectNodes, templatePath) {
  const wxmlTree = await getWxmlTree(wxmlStr, true, selectNodes, templatePath);
  return wxmlTree;
}
