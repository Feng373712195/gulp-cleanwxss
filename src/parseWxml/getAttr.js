// 取得表情的属性
export const getAttr = (tag,attr) => {
    const hasAttr = tag.indexOf(` ${attr}`)
    if( hasAttr ){
        const attrStrStartL = hasAttr + ` ${attr}=`.length;
        // 获取属性在标签的开始位置
        const startMark = tag.substr( attrStrStartL,  1);
        // 获取属性在标签的结束位置
        const endIndex = tag.substring( attrStrStartL + 1 , ).indexOf(startMark);
        //取得整段属性
        const AttrStr = tag.substring( attrStrStartL + 1 , attrStrStartL + endIndex + 1 )
        return AttrStr
    }else{
        return ''
    }
}
