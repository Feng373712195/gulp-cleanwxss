const isArray = obj => ([].isArray && [].isArray(obj)) || Object.prototype.toString.call(obj) == '[object Array]';
const isObject = obj => typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Object]';
//浅拷贝函数
const shallow = (data)=>{
    let o;
    if( isArray(data) ){
        o = [];
        data.forEach((val,index)=>{
            if(isArray(val)) o[index] = [...val];
            else if(isObject(val)) o[index] = {...val};
            else o[index] = val
        })
    }
    if( isObject(data) ){
        o = {};
        for( let x in data ){
            if(isArray(data[x])) o[x] = [...data[x]];
            else if(isObject(data[x])) o[x] = {...data[x]};
            else o[x] = data[x]
        }
    }
    return o
}

//拷贝wxmlTree
export const cloneWxmlTree = (nodes,parent = null,selectNode) => {
    const clone = [];
    nodes.forEach(node=>{       
        const nodeKey = Object.keys(node)[0]
        // 浅拷贝
        let cloneNode = shallow(node[nodeKey]);
        // 拷贝node指向新的parent
        cloneNode.parent = parent;
        if( cloneNode.childs.length ){ 
            // 把node的子node父级指向拷贝的node 
            cloneNode.childs = cloneWxmlTree(cloneNode.childs,{ key:nodeKey,obj:cloneNode },selectNode)
        }
        selectNode && _setNodeCache(cloneNode,cloneNode.class,cloneNode.id,selectNode)
        clone.push({ [nodeKey]:cloneNode });
    })
    return clone;
}