// 把Wxml字符串转为树结构
const getTemplateWxmlTree = async (temkey,wxmlStr,selectNodes,templatePath) => {
    return await getWxmlTree(wxmlStr,true,selectNodes,templatePath)  
}