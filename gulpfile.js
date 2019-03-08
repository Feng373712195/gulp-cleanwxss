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

// 2019-3-06 待做
// 标签选择器 处理
// _findNodeParent函数内部 区分id和class
// 完成后生成HTML

// 对已经查找过的节点位置缓存 下次可以直接在这里获取
const selectNodeCache = {}
// 样式选择器对应的Wxml片段 用于完成后生成HTML使用

const selectMap = {};
// 伪元素伪类匹配正则表达式
const pseudoClassReg = /\:link|\:visited|\:active|\:hover|\:focus|\:before|\:\:before|\:after|\:\:after|\:first-letter|\:first-line|\:first-child|\:lang\(.*\)|\:lang|\:first-of-type|\:last-of-type|\:only-child|:nth-last-child\(.*\)|\:nth-of-type\(.*\)|\:nth-last-of-type\(.*\)|\:last-child|\:root|\:empty|\:target|\:enabled|\:disabled|\:checked|\:not\(.*\)|\:\:selection/g;
//是否有同级选择器正则表达式 如： .a.b .a#b 
const peerSelectReg = /(?=\.)|(?=\#)/g;

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
    
    //获取Wxml树
    const WxmlTree = getWxmlTree(pageWxml);

    //检查同级元素
    const _checkHasSelect = (select) => {
        const peerSelect = select.split( peerSelectReg )
        if( peerSelect.length > 1 ){
            if( selectNodeCache[peerSelect[0]] ){
                const firstPeerSelect = selectNodeCache[peerSelect[1]][0];
                const firstPeerSelectKey = Object.keys( firstPeerSelect )[0];
                const otherPeerSelects = peerSelect.slice(1,peerSelect.length);
                return otherPeerSelects.map( ps=> selectNodeCache[ps] ).every( node => !!node )
            }else{
                return false;
            }
        }else{
            return selectNodeCache[peerSelect[0]] ? true : false;
        }
    }

    //寻找子元素的父级元素
    const _findNodeParent = (node,select) => {
        // 已经到达root节点 寻找不到节点
        if( node.parent.key == 'root' ) return null;

        const peerSelect =  select.split(peerSelectReg);
        if( peerSelect.length > 1 ){
            const finds = [];
            peerSelect.forEach(v1 => {
                //注意这里要区分id 和 class
                finds.push( node.parent.obj.class.findIndex(v2=> `.${v2}` == v1) )
            })
            const isParent = finds.every(v=> v!=-1 )
            return isParent ? node.parent.obj : 
                    _findNodeParent(node.parent.obj,select)
        }else{
            //注意这里要区分id 和 class
            const isParent = node.parent.obj.class.findIndex(v2=> `.${v2}` == select)
            return isParent != -1 ? node.parent.obj : 
                    _findNodeParent(node.parent.obj,select)
        }
    }
    
    //寻找元素里面是否含有指定标签
    const _findNodeHasTag = (node,tagname) => {
        for( let i = 0, len = node.childs.length; i < len ; i++ ){
            const key = Object.keys(node.childs[i])
            if( node.childs[i][key].tag == tagname ){
                return true;
            }else{
                if( _findNodeHasTag(node.childs[i][key],tagname) ) return true
            }
        }
        return false;
    }

    //从子节点开始查找
    for( let i = 0 ,len = classSelects.length; i < len; i++ ){
        //存入selectMap
        selectMap[classSelects[i]] = { };
        const that = selectMap[classSelects[i]];

        //过滤掉伪元素伪类
        const selectQuery = classSelects[i].replace(pseudoClassReg,'')
        //从子节点开始查找 把选择器数组翻转
        const selectNodes = selectQuery.split(' ').filter(v=>v).reverse();

        //选择器只匹配一个元素
        if( selectNodes.length == 1 ){
            that.select = _checkHasSelect(selectNodes[0])
        }
        //多元素选择器
        else{
           // 存放已查找到的元素
           let finds = []; 
           // 对于标签选择器后面再做处理
           let cureetNode = null;
           for( let i2 = 0,len = selectNodes.length; i2 < len; i2++ ){
                // 为标签选择器
                // 这里可以设置一个到某个元素停止搜索的参数 避免如这种情况 .a view .b view 避免到.a搜到view标签 .b还会继续搜索下去
                if( !/^\.|^\#/.test(selectNodes[i2]) ){
                    const currentFindNodes = finds.length ? 
                                             finds :
                                             selectNodeCache[selectNodes[i2+1]]
                    if( currentFindNodes ){    
                        const hasTag =  [];               
                        currentFindNodes.forEach((node,index)=>{
                            hasTag.push( _findNodeHasTag(node,selectNodes[i2]) )
                        })
                        if( hasTag.some(v=>v) ){ 
                            finds = currentFindNodes.concat();
                            that.select = true;
                            continue;
                        }else{
                            that.select = false;
                            break;
                        }
                    }else{
                        that.select = false;
                        break;
                    }
                }
                // 为class id选择器
                else{
                    if( i2 == 0 ){
                        if( _checkHasSelect(selectNodes[i2]) ){
                            const selectNode = selectNodeCache[selectNodes[i2]];    
                            const selectNodeKey = Object.keys(selectNode[0])[0]
                            selectNode.forEach(v=>{
                                finds.push( _findNodeParent( v ,selectNodes[i2+1] ) )
                            })

                            const hasParent = finds.some(v=>v);
                            if( selectNodes.length == 2 ){
                                that.select = hasParent ? true : false
                                break;
                            }else{
                                if( hasParent ){
                                    //过滤掉null值
                                    finds = finds.filter(v=>v)
                                    continue;
                                }else{
                                    that.select = false;
                                    break;
                                }
                            }

                        }else{
                            that.select = false;
                            break;
                        }
                    }
                    else if( i2 == selectNodes.length-1 ){
                        that.select = finds.some(v=>v);
                    }
                    else{
                        const _finds = [];
                        finds.map(node=> _findNodeParent( node ,selectNodes[i2+1] ) )
                        finds = finds.filter(v=>v);
                    }
                }
           }
        }
    }

    console.log( selectMap )

})


// 把Wxml结构转为树结构
// 在转成树结构的过程中就可以把所有节点存储起来
// 标签不会被覆盖 这个核实过了
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
    
        // 从上到下获取全部标签    
        // 注意标签连写情况 如：<view>A</view><view>B</view><view>C</view>
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
                    const startMark = tag.substr(startIndex + 3,1);
                    // 获得结束位置
                    const endIndex = tag.substring(startIndex + 4 ,tag.length).indexOf(startMark);
                    // 取得整段id
                    const TagIdStr = tag.substring( startIndex , startIndex + endIndex + 5 )
        
                    return TagIdStr.replace(/id=[\'|\"](.*)[\'|\"]/,'$1');
                }

                return "";
            }

            // 取得表情的属性
            const _getAttr = (tag,attr) => {
                const hasAttr = tag.indexOf(` ${attr}`)
                if( hasAttr ){
                    // 获取属性在标签的开始位置
                    const startMark = tag.substr( hasAttr + ` ${attr}=`.length ,  1);
                    console.log( startMark,'startMark' )
                    // 获取属性在标签的结束位置
                    const endIndex = tag.substring( hasAttr + ` ${attr}=`.length + 1 , ).indexOf(startMark);
                    console.log( endIndex )
                    //取得整段属性
                    const AttrStr = tag.substring( hasAttr + ` ${attr}=`.length + 1 , hasAttr + endIndex + 1 )
                    return AttrStr
                }else{
                    return ''
                }
            }

            // 取得标签名称
            const _getTagName = (tag)=>{
                const tagExec = /\<([\w|\-]+)\s?|\/(\w+)\s?\>/.exec(tag)
                const tagName = tagExec[1] ? tagExec[1] : tagExec[2];
                return tagName
            }

            // 存入节点缓存对象 
            const _setNodeCache = (tag,classes,id) =>{
                //避免用重复class元素
                if( classes ){
                    classes.forEach(classname=>{
                        if(!selectNodeCache[`.${classname}`]){
                            selectNodeCache[`.${classname}`] = [];
                        }
                        selectNodeCache[`.${classname}`].push(tag);
                    })
                }
                //避免有重复id元素
                if( id ){
                    if(!selectNodeCache[`#${id}`]){
                        selectNodeCache[`#${id}`] = [];
                    }
                    selectNodeCache[`#${id}`].push(tag);
                }
            }

            const tagClass = _getTagClass($1);
            const tagId = _getId($1);
            const tagName = _getTagName($1);

            // 是否import标签
            const isImportReg = /import/i; 
            // 是否template标签
            const isTemplateReg = /template/i;

            if( isImportReg.test(tagName) ){
                console.log( $1 );
                console.log( _getAttr($1,'src') )
            }

            if( isTemplateReg.test(tagName) ){
                console.log($1)
                console.log( _getAttr($1,'is') )
            }

            //是否单标签
            if( isSingeTagReg.test($1) ){
                const self = {
                    childs:[],
                    class:tagClass,
                    id:tagId,
                    tag:tagName,
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
            }
    
            //是否闭合标签
            if( isCloseTagReg.test($1) ){
                
                const isCompleteTag = isCompleteTagReg.test($1);
                
                // parentkey != 'root'  ||

                //需找到闭合标签 把指针指向上一层
                if( !isCompleteTag ){       
                    parentkey = head.parent.key
                    head = head.parent.obj
                }

                const self = {
                    childs:[],
                    class:tagClass,
                    id:tagId,
                    tag:tagName,
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
                    tag:tagName,
                    parent:{
                        key:parentkey,
                        obj:head
                    }
                }
            }
              
            _setNodeCache(self[$1],tagClass,tagId)

            head.childs.push(self);

            //把指针指向这个标签
            head = self[$1];
            parentkey = $1;
       
        }) 

        return WxmlTree;
}
