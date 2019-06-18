// 合并两个selectNode
// 把nodes2合并入nodes1 最终返回nodes1
export const mergeSelectNode = (nodes1,nodes2)=>{
    const node2Keys = Object.keys(nodes2)
    node2Keys.forEach(key=>{
        if( key !==  '__tag__' ){
            if(nodes1[key]){
                nodes1[key] = nodes1[key].concat(nodes2[key])
            }else{
                nodes1[key] = nodes2[key]
            }
        }
    })
    const node2TagKeys = Object.keys(nodes2.__tag__)
    node2TagKeys.forEach(key=>{
        if(nodes1.__tag__[key]){
            nodes1.__tag__[key] = nodes1.__tag__[key].concat(nodes2.__tag__[key])
        }else{
            nodes1.__tag__[key] = nodes2.__tag__[key]
        }
    })    
    return nodes1
}
