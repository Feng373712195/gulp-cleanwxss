/**
 * @author wzf
 * @deta  2019-03-03
 * @email 373712195@qq.com
 */
const gulp = require('gulp');
const path = require('path');
const fsp = require('fs-promise');

const PAGES_PATH = path.join(__dirname,'wx/wcjs_wx_miniprogram/pages')

// 查找不使用的 class
// 1· gulp 命令行中传入页面文件参数   
// 2· gulp 从中查找对应的WXML 和 WXSS
// 3· WXSS 引用的 WXSS 查找 对应的 WXML元素 包括引用到的模版 
// 4· 生成 HTML 页面 鼠标指定的地方会出来对应使用到的WXML元素

// 难点 - 根据CSS选择器规则去查找哪些元素使用到了
//     - 可能页面直接修改了模版的CSS 这种查找可能会比较麻烦
//     - 要注意有些CSS是用来动态渲染的 
//     - 一些JS渲染的CSS变量 这个似乎查找有些困难

// 2019-3-05 注意
// 元素从到内到外查找 如果是常用标签则选择它的父级 class元素
// Wmxl因该不能直接存标签字符串作为key 以免遇到相同的情况 会被覆盖

// 对已经查找过的节点位置缓存 下次可以直接在这里获取
const selectNodeCache = {}
// 样式选择器对应的Wxml片段 用于完成后生成HTML使用
const selectMap = {};
// 伪元素伪类匹配正则表达式
const pseudoClassReg = /\:link|\:visited|\:active|\:hover|\:focus|\:before|\:\:before|\:after|\:\:after|\:first-letter|\:first-line|\:first-child|\:lang\(.*\)|\:lang|\:first-of-type|\:last-of-type|\:only-child|:nth-last-child\(.*\)|\:nth-of-type\(.*\)|\:nth-last-of-type\(.*\)|\:last-child|\:root|\:empty|\:target|\:enabled|\:disabled|\:checked|\:not\(.*\)|\:\:selection/g;

gulp.task('one',async function(){
    const pageFilePath = path.join( PAGES_PATH,'/addtoptics' );
    const pageFiles = await fsp.readdir( pageFilePath,'utf-8')
    
    let pageWxss = await fsp.readFile( path.join( pageFilePath,pageFiles.find(v=>/\.wxss/.test(v)) ) ,'utf-8' );
    let pageWxml = await fsp.readFile( path.join( pageFilePath,pageFiles.find(v=>/\.wxml/.test(v)) ), 'utf-8' );

    // 获取Wxss中的选择器
    const classSelects = [];
    // 获取clss id 标签选择器
    pageWxss.replace(/([\.|\#|\w+].*)\{/g,($1,$2)=>{
        classSelects.push($2);
    })
    
    const WxmlTree = getWxmlTree(pageWxml);
    
    //遍历出所有节点
    // const deepWxmlTree = (tags,select)=>{
    //     for( const obj of tags ){
    //         const keys = Object.keys(obj);
    //         keys.forEach(key=>{
    //             if( obj[key].childs.length > 0 ){
    //                 deepWxmlTree(obj[key].childs)
    //             }
    //         })
    //     }
    // }

    // 选择器查找元素逻辑
    // 如果元素带有 伪元素或者伪类选择器 则无视 有对应元素标签就为有使用的选择器
    // 属性选择器 如果在标签内判断有对应的属性名 就为有使用的选择器

    for( let i = 0 ,len = classSelects.length; i < len; i++ ){

        //存入selectMap
        selectMap[classSelects[i]] = { };
        const that = selectMap[classSelects[i]];

        //过滤掉伪元素伪类
        const selectQuery = classSelects[i].replace(pseudoClassReg,'')
        const selectNodes = selectQuery.split(' ').filter(v=>v).reverse();

        // 只有一个选择器的情况下
        if( selectNodes.length == 1 ){
            // console.log('here',selectNodes)
            let peerSelect = selectNodes[0].split(/(?=\.)|(?=\#)/g);
            // 是否有同级选择器
            if( peerSelect.length > 1 ){
                console.log( selectNodeCache[ peerSelect[0] ],'123' )               
            }else{
            //没有同级情况
                that.select =  selectNodeCache[selectNodes[0]] ? true : false;
            }
        }else{
            let hasFirst = false;
            //如果第一个元素都没有就不往下寻找元素了
            let peerSelect = selectNodes[0].split(/(?=\.)|(?=\#)/g);
             // 是否有同级选择器
            if( peerSelect.length > 1 ){
                
            }else{
                hasFirst = selectNodeCache[selectNodes[0]] ? true : false;
            }
        }

    }



})



const hasNodes = (select) => {

};

const testFun = (node,select) => {
    // console.log(node,'node')
    // console.log(select,'select')

    node[Object.keys(node)[0]].childs.forEach(child=>{
        console.log(child)
    })
}

// 相对于节点寻找元素
const relativeSearchNode = (node,select) => {
    node.childs.forEach(child=>{
        child=>{
            console.log(child,'child')
        }
    })
}

// 把Wxml结构转为树结构
// 在转成树结构的过程中就可以把所有节点存储起来
const getWxmlTree = (wxmlStr)=>{
        //过滤调pageWxml中的注释
        wxmlStr = wxmlStr.replace(/\<!--(.*)-->/g,'')

        //Wxml树结构
        const WxmlTree = {
            root:{
                childs:[

                ],
                parent:{
                    key:null,
                    obj:null,
                }
            }
        };
    
        let head = WxmlTree.root;
        let parentkey = 'root';
    
        //从上到下获取全部标签
        wxmlStr.replace(/\<.*\>/g,($1,$2)=>{
    
            const isSingeTagReg = /\<(.*)\/\>/;
            const isCloseTagReg = /\<\/(.*)\>/;
            const isCompleteTagReg = /\<.*\>.*\<.*\>/

            // 取得标签内的Class
            const _getTagClass = (tag,arr)=>{
                
                let TagClass = arr ? arr : [];
                
                // 判断前面是否有空格 避免匹配到 *-class 
                const hasClass = /\s+class=/;
                // 判断标签是否拥有class
                if( hasClass.test(tag) ){
                    // 获取class属性在标签的开始位置
                    const startIndex = tag.search(/class\=[\'|\"]/)
                    // 判断开始是双引号还是单引号
                    const startMark = tag.substr(startIndex+6,1);
                    // 获得结束位置
                    const endIndex = tag.substring(startIndex + 7 ,tag.length).indexOf(startMark);
                    // 取得整段class
                    const TagClassStr = tag.substring( startIndex , startIndex + endIndex + 8 );

                    TagClassStr.replace( /class=[\'|\"](.*)[\'|\"]/,function(classStr,classNames){
                        TagClass = TagClass.concat( classNames.split(" ").filter(v=>v) )
                    })

                    // 一些写法不规范的开发者 会写多个class 这里先不管
                    tag = tag.replace(TagClassStr,'');
                    if( hasClass.test(tag) ) {
                       return _getTagClass(tag,TagClass)
                    }
                }

                return TagClass;
            }
   
            // 取得标签内的id
            const _getId = (tag)=>{
                // 判断前面是否有空格 避免匹配到 *-class 
                const hasId =  /\s+id=/;
                if( hasId.test(tag) ){

                    // 获取id属性在标签的开始位置
                    const startIndex = tag.search(/id\=[\'|\"]/)
                    // 判断开始是双引号还是单引号
                    const startMark = tag.substr(startIndex+3,1);
                    // 获得结束位置
                    const endIndex = tag.substring(startIndex + 4 ,tag.length).indexOf(startMark);
                    // 取得整段id
                    const TagIdStr = tag.substring( startIndex , startIndex + endIndex + 5 )
        
                    return TagIdStr.replace(/id=[\'|\"](.*)[\'|\"]/,'$1');
                }

                return "";
            }

            // 存入节点缓存对象 
            const _setNodeCache = (tag,classes,id) =>{
                if( classes ){
                    classes.forEach(classname=>{
                        selectNodeCache[`.${classname}`] = tag;
                    })
                }
                if( id ){
                    selectNodeCache[`#${id}`] = tag
                }
            }

            const tagClass = _getTagClass($1);
            const tagId = _getId($1);
            
            //是否单标签
            if( isSingeTagReg.test($1) ){
                const self = {
                    childs:[],
                    class:tagClass,
                    id:tagId,
                    parent:{
                        key:parentkey,
                        obj:head    
                    }
                }
                _setNodeCache(self,tagClass,tagId)

                head.childs.push({
                    [$1]:self
                })
                return; 
            };
    
            //是否闭合标签
            if( isCloseTagReg.test($1) ){
                
                const isCompleteTag = isCompleteTagReg.test($1);
                
                //需找到闭合标签 把指针指向上一层
                if( parentkey != 'root'  ||  !isCompleteTag ){
                    parentkey = head.parent.key
                    head = head.parent.obj
                }

                const self = {
                    childs:[],
                    class:tagClass,
                    id:tagId,
                    parent:{
                        key:parentkey,
                        obj:head    
                    }
                }

                                
                if( isCompleteTag ){
                    _setNodeCache(self,tagClass,tagId)
                }

                head.childs.push({
                    [$1]:self
                })
    
                return;
            }
            
            //不是闭合标签 也不是 单标签 就是启始标签
            const self = {
                [$1]:{
                    childs:[],
                    class:tagClass,
                    id:tagId,
                    parent:{
                        key:parentkey,
                        obj:head
                    }
                }
            }
              
            _setNodeCache(self,tagClass,tagId)

            head.childs.push(self);
            //把指针指向这个标签
            head = self[$1];
       
        }) 

        return WxmlTree;
}


