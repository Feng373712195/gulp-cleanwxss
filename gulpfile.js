/**
 * @author wzf
 * @deta  2019-03-03
 * @email 373712195@qq.com
 */
const gulp = require('gulp');
const path = require('path');
const fsp = require('fs-promise');

const WX_DIR_PATH = path.join(__dirname,'wx/wcjs_wx_miniprogram')
const PAGES_PATH = path.join(WX_DIR_PATH,'/pages')

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


// 2019-3-23
// 选择器处理进度
// element	p	选择所有 <p> 元素。	1 《处理》
// element,element	div,p	选择所有 <div> 元素和所有 <p> 元素。	1  逗号分割的当作多个选择器处理 《处理》
// element element	div p	选择 <div> 元素内部的所有 <p> 元素。	1 《处理》
// element>element	div>p	选择父元素为 <div> 元素的所有 <p> 元素。	2
// element+element	div+p	选择紧接在 <div> 元素之后的所有 <p> 元素。	2
// 要注意 @supper @miade @keyfame 可能拼错了 -。- 的写法处理
// 插件使用方法 参考 uncss
// 注意模版中的模版的是否可以处理 OK
// js 动态渲染的class 或者 id 要特殊处理
// 插件最后 记得写上测试用例
// 不对注释节点处理 OK
// 样式选择器对应的Wxml片段 用于完成后生成HTML使用

// 2019-3-24
// 优化 异步报错机制 OK
// selectNode 问题 OK

// 2019-3-25
// 把未匹配的选择器存储起来 下次遇到类似的选择器不用再去重复查找 

// 2019-3-26
// css 还需要处理引入 css 引入的css中还有引入的问题 
// 模版中重复is使用的模版可以跳过不再处理 OK
// 没引入的模版class 的选择器也存入selectNode了 OK

// 2019-3-27
// 组件的 传入class名称也要留意如何处理 OK
// selectNode 发现有class名称截取有问题 如模板中 'A B' 分别为两个class 没有处理好 OK
// improt 引用路径不一样 其实模板是一样的问题 
// .tags-list .tag.active  { select: false } 错误  .top-swiper-dots .dot.active  { select: false } 错误  包含动态渲染的class 这种情况下判断选择器是否在用有问题 ok

// 2019-5-02 
// 过滤样式表注释 ok



const selectMap = {};
// 伪元素伪类匹配正则表达式
const pseudoClassReg = /\:link|\:visited|\:active|\:hover|\:focus|\:before|\:\:before|\:after|\:\:after|\:first-letter|\:first-line|\:first-child|\:lang\(.*\)|\:lang|\:first-of-type|\:last-of-type|\:only-child|:nth-child\(.*\)|:nth-last-child\(.*\)|\:nth-of-type\(.*\)|\:nth-last-of-type\(.*\)|\:last-child|\:root|\:empty|\:target|\:enabled|\:disabled|\:checked|\:not\(.*\)|\:\:selection/g;
//是否有同级选择器正则表达式 如： .a.b .a#b 
const peerSelectReg = /(?=\.)|(?=\#)/g;

/**
 * '/addtoptics' 
 * '/all_column' 检查完毕 没有问题
 * '/assistant'  检查完毕 没有问题
 * '/authorization' 检查完毕 没有问题
 * '/autoActivities' 检查完毕 没有问题
 * '/brands' 检查完毕 没有问题
 * '/carerrating' 检查完毕 没有问题
 * '/carHot' 检查完毕 没有问题
 * '/carHotDetaill' 检查完毕 没有问题
 * '/chat' 检查完毕 没有问题
 * '/chatWindow' 检查完毕 没有问题
 * '/clause' 检查完毕 没有问题
 * ‘/columns' 检查完毕 没有问题
 * '/commentDetail' 检查完毕 没有问题
 * '/config' 检查完毕 没有问题
 * '/configuration' 太复杂 优先级放到最后 不过应该是没问题
 * ‘/customer_chat’ 检查完毕 没有问题
 * ‘/detail’
 */

const PAGE_DIR_PATH = '/detail'
// 用来收集css变量 开发时使用
const _cssVariable = new Set()

const cssVariable = {

    // ‘carHot Page use’
    // 'cls':['fade'],
    // 'pagenumAnimation':['pagenum-animation1','pagenum-animation2'],
    // 'item.animatonData':['title-animation'],
    // 'swiperdata':['zoom-background-image'],
    // 'item.danmuCls':['slidein','slideout'],
    // 'InnerItem.cls':['rotate0To90','rotate270To360'],
    // 'item.prevCls':['numFadeOut'],
    // 'item.nextCls':['numFadeIn'],
    // 'ohSnap.cls':['show']

    // 'compareCarList Page use'  
    // 'item.bttoClassTOM':['compare-edit-btn','compare-begin-btn'],
    // 'item.bttoClass':['c-linergradient-blue-bg','c-linergradient-yellow-bg']

    // 'configuration Page use'
    tabBtnCurrentIndex:[1,2,3] 
}


gulp.task('one',async function(){

    const pageFilePath = path.join( PAGES_PATH, PAGE_DIR_PATH );
    const pageFiles = await fsp.readdir( pageFilePath, 'utf-8' )
    
    let pageWxss = await fsp.readFile( path.join( pageFilePath,pageFiles.find(v=>/\.wxss/.test(v)) ) ,'utf-8' );
    let pageWxml = await fsp.readFile( path.join( pageFilePath,pageFiles.find(v=>/\.wxml/.test(v)) ), 'utf-8' );

    pageWxss = await getWxss(pageWxss)

    // 获取Wxss中的选择器
    const classSelects = [];
    // 获取clss id 标签选择器
    pageWxss.replace(/([\.|\#|\w+].*)\{/g,($1,$2)=>{
        classSelects.push($2);
    })

    //获取Wxml树
    const { WxmlTree,selectNodeCache } = await getWxmlTree(pageWxml);

    console.log( _cssVariable,'_cssVariable' )

    //检查同级元素
    const _checkHasSelect = (select) => {
        const peerSelect = select.split( peerSelectReg )
        const firstSelect = !/^\.|^\#/.test(peerSelect[0]) ? selectNodeCache.__tag__[peerSelect[0]] : selectNodeCache[peerSelect[0]]
        // peerSelect 大于 1 则为拥有同级选择器 如：.a.b
        if( peerSelect.length > 1 ){
            // 判断同级的第一个选择器在页面中有没有元素使用
            if(  firstSelect ){
                const otherPeerSelects = peerSelect.slice(1,peerSelect.length);
                // 匹配到的元素 推入这个数组
                let matchNodes = firstSelect.concat();
                return matchNodes = matchNodes.filter(node=>{
                    return otherPeerSelects.some(select=>{
                        // 如果是class
                        if( select[0] == '.' ){
                           return node.class.indexOf(select.slice(1)) != -1
                        // 如果是id
                        }else if( select[0] == '#' ){
                           return node.id == select.slice(1)
                        // 如果是标签
                        }else{
                        //    return _findNodeHasTag(node,select)
                            return node.tag == select
                        }
                    }) 
                })
            }else{
                return null;
            }
        }else{
            return firstSelect ? firstSelect : null;
        }
    }

    //寻找子元素的父级元素
    const _findNodeParent = (node,select,deep = 9999) => {        
        --deep;
        // 已经到达root节点 寻找不到节点
        if( node.parent.key == 'root' ) return null;

        const peerSelect =  select.split(peerSelectReg);
        if( peerSelect.length > 1 ){
            const finds = [];
            peerSelect.forEach(v1 => {
                //注意这里要区分id 和 class
                if( v1[0] == '.' ){
                    finds.push( node.parent.obj.class.findIndex(v2=> `.${v2}` == v1) )
                }else if( v1[1] == '#' ){
                    finds.push( node.parent.obj.id == v1 )
                }else{
                    finds.push( node.parent.obj.tag == v1 )
                }

            })
            const isParent = finds.every(v=> v!=-1 )
            if( deep == 0 ){
                return isParent ? node.parent.obj : null
            }else{
                return isParent ? node.parent.obj : 
                                  _findNodeParent(node.parent.obj,select)
            }
        }else{
            let isParent = false

            if( select[0] == '.' ){
                isParent = node.parent.obj.class.findIndex(v2=> `.${v2}` == select) != -1 ? true : false
            }else if( select[1] == '#' ){
                isParent = node.parent.obj.id == select
            }else{
                isParent = node.parent.obj.tag ? node.parent.obj.tag == select : false
            }

            if( deep == 0 ){
                return isParent ? node.parent.obj : null
            }else{
                return isParent ? node.parent.obj : 
                        _findNodeParent(node.parent.obj,select)
            }
        }
    }
    
    //寻找元素里面是否含有指定标签
    const _findNodeHasTag = (node,select,deep = 9999) => {
        --deep;
        for( let i = 0, len = node.childs.length; i < len ; i++ ){
            
            const key = Object.keys(node.childs[i])
            
            if( select[0] == '.' &&  node.childs[i][key].class.indexOf(select.slice(1)) != -1 
                || select[0] == '#' &&  node.childs[i][key].id == select.slice(1)
                || node.childs[i][key].tag == select ){
                return true;
            }else{
                if( deep == 0 ) return false;
                if( _findNodeHasTag(node.childs[i][key],select) ) return true
            }
        }
        return false;
    }

    // 检查后代选择器是否生效
    const checkSelectQuery = (classSelect,findNodes = null,type) => { 

        // console.log( classSelect,'classSelect' )

        let selectNodes = null
        
        // 子元素选择器 >
        if( type == 'child' ){
            selectNodes = classSelect.replace('>',' ').split(' ').filter(v=>v).reverse();

            if( findNodes && findNodes.select ){
                //如果 过上一级查找到的元素 过滤一下找到的查找到的元素
                // findNodes.nodes = /^\.|^\#/.test(selectNodes[0]) ? 
                //                 selectNodeCache[selectNodes[0]] : 
                //                 selectNodeCache.__tag__[selectNodes[0]]
                //如果没有查找到元素 返回false
                if( findNodes.nodes.length == 0 ) return false;
                const newFinds = []
                findNodes.nodes.forEach( node => newFinds.push( _findNodeParent(node,selectNodes[0]) ) )
                findNodes.nodes = newFinds.filter(v=>v);
            }
        }
        // 后代选择器 
        else
        {
            //过滤掉伪元素伪类
            const selectQuery = classSelect.replace(pseudoClassReg,'')
            //从子节点开始查找 把选择器数组翻转
            selectNodes = selectQuery.replace(/\s?\>\s?/,'>').split(/\s/g).filter(v=>v).reverse();
        }

        //选择器只匹配一个元素
        if( selectNodes.length == 1 ){
            if( ~selectNodes[0].indexOf('>') ){
               return checkChildSelectQuery(selectNodes[0]) 
            }
            // that.select = _checkHasSelect(selectNodes[0]) ? true : false
            return  _checkHasSelect(selectNodes[0]) ? true : false
        }
        //多元素选择器
        else{
           // 存放已查找到的元素
           let finds = findNodes ? findNodes.nodes : []; 
           // 把选择器转化成数组 如 .search-block .search-list .tag 转为 [.tag,.search-list,.search-block]
           for( let i2 = 0,len = selectNodes.length; i2 < len; i2++ ){
            
                // console.log( selectNodes[i2],'selectNodes[i2]',i2,selectNodes.length-1 )

                if( ~selectNodes[i2].indexOf('>') ){

                    const checkChildSelectQueryRes = checkChildSelectQuery(
                                                        selectNodes[i2],
                                                        { select:i2 != 0 ? selectNodes[i2-1] : '',nodes:finds }
                                                    )
                    
                    

                    if( i2 == selectNodes.length - 1 ){
                        return checkChildSelectQueryRes.some(v=>v)
                    }else{
                        if( checkChildSelectQueryRes ){
                            finds = checkChildSelectQueryRes
                            continue
                        }
                        else return false
                    }
                }
                
                if( findNodes && findNodes.select && type == 'child' && i2 == 0 ){
                    if(finds.length > 0){
                        continue
                    }else{
                        return false
                    }
                }

                //2019-5-2 重写这段逻辑
                if( i2 == 0 ){
                    let matchNode = null
                    if( matchNode = _checkHasSelect(selectNodes[i2]) ){
                        finds = matchNode
                    }else{
                        return false
                    }
                }else{
                    const newFinds = []
                    finds.forEach(node=>{
                        newFinds.push(type == 'child' ?
                                            _findNodeParent(node,selectNodes[i2],1) :
                                            _findNodeParent(node,selectNodes[i2]) )
                    })

                    finds = newFinds.filter(v=>v);

                    if(finds.length == 0){
                        return false
                    }
                }

                if( i2 == selectNodes.length-1 ){
                    if( type == 'child' ) return finds
                    return finds.some(v=>v)
                }else{
                    continue;
                }

           }
        }
    }

    // 检查兄弟选择器是否生效
    const checkChildSelectQuery = (classSelects,findNodes = null) => {
        return checkSelectQuery(classSelects,findNodes,'child')
    }

    //从子节点开始查找
    for( let i = 0 ,len = classSelects.length; i < len; i++ ){

        //存入selectMap
        selectMap[classSelects[i]] = { };
        const that = selectMap[classSelects[i]];
        
        // Page选择器 特殊处理
        if( classSelects[i].match(/^page/i) ){
            that.select = true;
            continue;
        }

        // 是否为逗号分隔
        let separateClassSelect = classSelects[i].split(',') 

        // 有逗号分隔的选择器 其中一项有被使用就返回true
        // 注意: 可以优化 在最后制作弹出的HTML 显示哪些被动 哪些没用 可以让使用者删除更多无用代码
        if( separateClassSelect.length > 1 ){
            that.select = separateClassSelect.some( classSelect => checkSelectQuery(classSelect) )
        }else{
            that.select = checkSelectQuery(classSelects[i])
        }

    }

    // console.log( selectNodeCache )
    // console.log( selectMap )

    // console.log( '==================' )
    // 检查没有被选中的元素
    for( let x in selectMap ) {
        !selectMap[x].select && console.log(x,selectMap[x])
    }
})

const debug = (str,plase = true)=> {
    const isDebug = true;
    isDebug && plase && console.log(str)
}

// 这个方法用来过滤掉Wxss中的注释
// 和引入@import
const getWxss = (str) => {
    
    const improts = [];

    // 过滤掉wxss中的注释
    str = str.replace(/\/\*([\s\S]*?)\*\//g,'')

    // 过滤掉keyframes
    str = str.replace(/\s?@keyframes.*\{([\s\S]*?)\n\}/g,'')
    // 过滤掉font-face
    str = str.replace(/\s?@font-face.*\{([\s\S]*?)\n\}/g,'')

    // 获取wxss中的import
    // 2019-05-04
    // 如果文件中还有improt呢 需要处理这种情况
    str.replace(/@import\s?[\'|\"](.*)[\'|\"]\;/g,($1,$2)=>{
        improts.push($2)
    });

    if( improts.length == 0 ) return str 

    const findWxss = (importSrc) => { 
                        return new Promise((resolve,reject) => {
                            const wxssPath = path.join( path.join( PAGES_PATH,PAGE_DIR_PATH ), importSrc );
                            fsp.readFile(wxssPath,'utf-8')
                            .catch(err=>{
                                const wxssPath = path.join( WX_DIR_PATH,importSrc )
                                return fsp.readFile(wxssPath,'utf-8')
                            })
                            .then(res=>{
                                resolve(res)
                            })
                            .catch(err=>{
                                console.log(err,'err')
                                console.log('没有找到wxss文件 wxss文件地址:',importSrc);
                                reject(err)
                            })
                        })       
                     }
    
    return Promise.all(improts.map( src=> findWxss(src) ))
    .then(res=>{
        let resWxss = str
        res.forEach(async wxss => {
           wxss = await getWxss(wxss)
           resWxss = `${wxss} \n ${ await resWxss }`;
        })
        return resWxss
    })
    .catch(err=>{
        console.log(err)
    })
    
    
}

// 取得表情的属性
const getAttr = (tag,attr) => {
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

// 把Wxml字符串转为树结构
// 在转成树结构的过程中就可以把所有节点存储起来
// 标签不会被覆盖 这个核实过了

// 2019-03-21 
// selectNodeCache不再作为全局变量 而作为getWxmlTree的返回值
const getWxmlTree =  (wxmlStr,isTemplateWxml = false ,mianSelectNodes = { __tag__:{} })=>{

    const templateStartTagReg = /\<template.*\s+name=/
    const useTemplateTagReg = /\<template.*\s+is=/
    //是否字符串正则表达式
    const isStringReg = /[\'|\"](.*?)[\'|\"]/

    // 对已经查找过的节点位置缓存 下次可以直接在这里获取 针对class id  
    // 2019-4-8 新增__tag__ 用来存放 tag所有对应标签元素
    let _selectNodes = { __tag__:{} };

    // template层数 isTemplateWxml为true时会用到
    let templateCount = 0;

    // 解析模版wxmlTree时 会存在这个对象
    let templateNode = { }
    // 当前处理模板名称
    let currentTemplateName = ''

    //存放找到的模版
    const findTemplates = {}
    // 模版缓存
    const templateCache = {}
    // 找到的使用模版 反正重名 使用数组
    const findUseTemplates = []

    // 过滤调pageWxml中的注释 
    wxmlStr = wxmlStr.replace(/\<!--([\s\S]*?)-->/g,'')

    //Wxml树结构
    let WxmlTree = {
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
    
    // 重置Wxml树
    const resetWxmlTree = ()=>{
        const newWxmlTree = {
            root:{
                childs:[

                ],
                parent:{
                    key:null,
                    obj:null,
                }
            }
        }
        head = newWxmlTree.root
        parentkey = 'root'
        _selectNodes = { __tag__:{} }
        return newWxmlTree
    }

    const getJoinClass = (str,res = [])=>{
        
        const getSumValueReg = /\s?([\"|\']?[a-zA-Z0-9_\- ]+\s?[\'|\"]?)\s?\+{1}\s?([\"|\']?[a-zA-Z0-9_\- ]+\s?[\'|\"]?)\s?/ 
        let sumVal = ''

        while( sumVal = getSumValueReg.exec(str) ){

            let sumL = []
            let sumR = []
            let sumClass = []

            let [ sumExpression,sumLVal,sumRVal ] = sumVal 
            sumLVal = sumLVal.trimLeft().trimRight()
            sumRVal = sumRVal.trimLeft().trimRight()
            str = str.replace( sumExpression,'customCssVariable' )

            if( isStringReg.test(sumLVal) ){
                const classes = sumLVal.replace(isStringReg,'$1').split(' ')
                const lastClass = classes.pop()
                if( classes.length ){ res = res.concat( classes ) }
                sumL.push( lastClass )
            }else if( cssVariable[sumLVal] ){
                _cssVariable.add( sumLVal )
                sumL = sumL.concat( cssVariable[sumLVal] )
            }

            if( isStringReg.test(sumRVal) ){
                const classes = sumRVal.replace(isStringReg,'$1').split(' ')
                const lastClass = classes.pop()
                if( classes.length ){ res = res.concat( classes ) }
                sumR.push( lastClass )
            }else if( cssVariable[sumRVal] ){
                _cssVariable.add( sumRVal )
                sumR = sumR.concat( cssVariable[sumRVal] )
            }

            sumL.forEach(L => {
                sumR.forEach(R => { sumClass.push( `${L}${R}` ) })
            })
            
            cssVariable['customCssVariable'] = sumClass

            if( ~str.indexOf('+') ){
                //自定义的 css变量
                return getJoinClass(str,res)
            }else{
               if( cssVariable['customCssVariable'] ){
                    res = res.concat( cssVariable['customCssVariable'] )
               }
               delete cssVariable['customCssVariable']
               return res 
            }

        }

    }

    const getDynamicClass = (str) => {
        if( str != ''  ){
            if( isStringReg.test(str) ){
                const classes = getJoinClass(str);
                return classes ? classes : [str]
            }else if( cssVariable[str] ){
                return cssVariable[str]
            }
        }

    }

    // 取得标签内的Class
    // 注意还有hover-class 之类的情况
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
            let TagClassStr = tag.substring( startIndex , startIndex + endIndex + 8 );
            
            //获取动态选人的class
            const dynamicClassReg = /\{\{(.*?)\}\}/
            // 是否为三元表达式
            const ternaryExpressionReg = /(.*)\?(.*)\:(.*)/

            let dynamicClass = '';

            while( dynamicClass = dynamicClassReg.exec(TagClassStr) ){

                if( ternaryExpressionReg.test(dynamicClass[1]) ){
                    dynamicClass[1].replace(ternaryExpressionReg,($1,$2,$3,$4)=>{
                        

                        $3 = $3.trimLeft().trimRight()
                        $4 = $4.trimLeft().trimRight()
                        let = res = null
                        
                        res = getDynamicClass($3)
                        TagClass = TagClass.concat( res )

                        if( !isStringReg.test($3) ){
                            _cssVariable.add($3)
                        }

                        res = getDynamicClass($4)
                        TagClass = TagClass.concat( res )

                        if( !isStringReg.test($4) ){
                            _cssVariable.add($4)
                        }
                    })
                }else{
                    if( dynamicClass[1] != '' ){

                        dynamicClass[1] = dynamicClass[1].trimLeft().trimRight()

                        TagClass = TagClass.concat( getDynamicClass(dynamicClass[1]) )

                        if( !isStringReg.test(dynamicClass[1]) ){
                            _cssVariable.add( dynamicClass[1] )
                        }
                    }
                }

                TagClassStr = TagClassStr.replace(dynamicClass[0],'')
            }

            TagClassStr.replace(/class=[\'|\"](.*)[\'|\"]/,function(classStr,classNames){
                TagClass = TagClass.concat( classNames.split(" ").filter(v=>v) )
            })

            // console.log( TagClass,'TagClass' )

            // 一些写法不规范的开发者 会写多个class 这里先不管
            tag = tag.replace(/(class=[\'|\"].*?[\'|\"])/,'');
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
    
    // 取得标签名称
    const _getTagName = (tag)=>{
        const tagExec = /\<([\w|\-]+)\s?|\/([\w|\-]+)\s?\>/.exec(tag)
        const tagName = tagExec[1] ? tagExec[1] : tagExec[2];
        return tagName
    }

    // 存入节点缓存对象 
    const _setNodeCache = (tag,classes,id,selectNodes)=>{

        //避免用重复class元素
        if( classes.length ){
            classes.forEach(classname=>{
                if(!selectNodes[`.${classname}`]){
                    selectNodes[`.${classname}`] = [];
                }
                selectNodes[`.${classname}`].push(tag);
            })
        }
        //避免有重复id元素
        if( id ){
            if(!selectNodes[`#${id}`]){
                selectNodes[`#${id}`] = [];
            }
            selectNodes[`#${id}`].push(tag);
        }
        
        selectNodes.__tag__[tag.tag] ? selectNodes.__tag__[tag.tag].push(tag) : (selectNodes.__tag__[tag.tag] = [tag])
    }
    
    // 合并两个selectNode
    // 把nodes2合并入nodes1 最终返回nodes1
    const mergeSelectNode = (nodes1,nodes2)=>{
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
                    
    const isSingeTagReg = /\<(.*)\/\>/;
    const isCloseTagReg = /\<\/(.*)\>/;
    const isCompleteTagReg = /\<.*\>.*\<.*\>/

    // 是否import标签
    const isImportReg = /import/i; 
    // 是否template标签
    const isTemplateReg = /template/i;
    
    return new Promise( async (resolve,reject)=>{
        // 从上到下获取全部标签    
        // 注意标签连写情况 如：<view>A</view><view>B</view><view>C</view>
        let match = null

        while( match = /\<[\s\S]*?\>/.exec(wxmlStr) ){

            let $1 = match[0]
            wxmlStr = wxmlStr.replace($1,'');

            const tagClass = _getTagClass($1);
            const tagId = _getId($1);
            const tagName = _getTagName($1);

            if( isImportReg.test(tagName) && !/\<\s?\/import/i.test($1) ){
                let importSrc =  getAttr($1,'src');
                importSrc = /.*\.wxml$/i.test(importSrc) ? importSrc : importSrc + '.wxml'
                
                findTemplates[importSrc] =  () => new Promise( async (_resolve,_reject)=>{
                    let templatePath = '';
                    
                    // 查找模版规则 首先查找相对路径 如果相对路径没有 则尝试绝对路径 如果都没有则弹出错误 当时不印象继续往下执行
                    templatePath = path.join( path.join( PAGES_PATH,PAGE_DIR_PATH ), importSrc );
                    fsp.readFile(templatePath,'utf-8')
                    .catch(err=>{
                        templatePath = path.join( WX_DIR_PATH,importSrc )
                        return fsp.readFile(templatePath,'utf-8')
                    })
                    .catch(err=>{
                        console.log(err,'err')
                        console.log('没有找到模版文件 模版地址:',importSrc);
                        reject()
                    })
                    .then(tmp =>{
                        return getTemplateWxmlTree(importSrc,tmp,mianSelectNodes)
                    })
                    .then(res =>{
                        // console.log( 'resolve ===========' )
                        _resolve(res)
                    })
                    .catch(err=>{
                        console.log('getTemplateWxmlTree执行时遇到错误')
                        console.log(err)
                        reject()
                    })

                })
            }

            if( isTemplateWxml && isTemplateReg.test(tagName) ){
                // 模板包裹 的启始template标签找到 
               if( templateStartTagReg.test($1) ){
                    ++templateCount
                    currentTemplateName = getAttr($1,'name')
                    templateNode[currentTemplateName] = {
                        templateWxmlTree:null,
                        selectNode:null
                    }
                    continue;
               }
            }

            //是否单标签
            if( isSingeTagReg.test($1) ){
                // console.log('是单标签')

                const self = {
                    [$1]:{
                        childs:[],
                        class:tagClass,
                        id:tagId,
                        tag:tagName,
                        statrTag:true,
                        endTag:true,
                        parent:{
                            key:parentkey,
                            obj:head    
                        }
                    }
                }

                //收集使用的模版
                if( useTemplateTagReg.test($1) ){
                    findUseTemplates.push( { [getAttr($1,'is')] : self } )
                }
                _setNodeCache(self[$1],tagClass,tagId,_selectNodes)

                head.childs.push(self)

                continue;
            }
    
            //是否闭合标签
            if( isCloseTagReg.test($1) ){
                // console.log('是闭合标签')

                if( isTemplateWxml && isTemplateReg.test(tagName) ){
                    --templateCount
                    // 模板包裹 的闭合template标签找到 
                    if( templateCount == 0 ){
                        templateNode[currentTemplateName].templateWxmlTree = WxmlTree.root.childs
                        templateNode[currentTemplateName].selectNode = _selectNodes;
                        WxmlTree = resetWxmlTree()
                        continue;
                    }
                }

                const isCompleteTag = isCompleteTagReg.test($1);

                //需找到闭合标签 把指针指向上一层
                if( !isCompleteTag ){
                    try{
                        // console.log(head)
                        parentkey = head.parent.key
                        head = head.parent.obj
                    }catch(e){
                        console.log('完毕标签 head 报错')
                        console.log(e)
                        return;
                    }   
                }

                const self = {
                    [$1]:{
                        childs:[],
                        class:tagClass,
                        id:tagId,
                        tag:tagName,
                        statrTag:isCompleteTag ? true : false,
                        endTag:true,
                        parent:{
                            key:parentkey,
                            obj:head    
                        }
                    }
                }

                //收集使用的模版
                if( useTemplateTagReg.test($1) ){
                    findUseTemplates.push( { [getAttr($1,'is')] : self } )
                }

                if( isCompleteTag ){
                    // console.log( _selectNodes,'selectNodes' )
                    _setNodeCache(self[$1],tagClass,tagId,_selectNodes)
                }

                try{
                    // console.log(head)
                    head.childs.push(self)
                }catch(e){
                    console.log('闭合标签 head 报错')
                    console.log(e)
                    return;
                }

                continue;
            }

            // console.log('是起始标签')
            
            //不是闭合标签 也不是 单标签 就是启始标签
            const self = {
                [$1]:{
                    childs:[],
                    class:tagClass,
                    id:tagId,
                    tag:tagName,
                    statrTag:true,
                    endTag:false,
                    parent:{
                        key:parentkey,
                        obj:head
                    }
                }
            }

            //收集使用的模版
            if( useTemplateTagReg.test($1) ){
                findUseTemplates.push( { [getAttr($1,'is')] : self } )
            }

            if( isTemplateWxml && isTemplateReg.test(tagName) ){
                ++templateCount
            }
            
            // console.log( _selectNodes,'selectNodes' )
            _setNodeCache(self[$1],tagClass,tagId,_selectNodes)
            
            try{
                // console.log(head)
                head.childs.push(self)
            }catch(e){
                console.log('启始标签 head 报错')
                console.log(e)
                return;
            }

            //把指针指向这个标签
            head = self[$1];
            parentkey = $1;
    
        }

        // 处理import元素 找到的模板存入到templateCache
        for( const name in findTemplates ){
            templateCache[name] = await findTemplates[name]()
        }
        
        // 遍历在wxml中找到 带有is属性的template标签 
        findUseTemplates.forEach(usetml=>{
            // 准备被替换的模版
            let replaceTml = null;
            const useTemplateName = Object.keys(usetml)[0];

            for( let importTmlPath in templateCache ){
                if( templateCache[importTmlPath][useTemplateName] ){
                    replaceTml = templateCache[importTmlPath][useTemplateName]
                    replaceTml.count ? (++replaceTml.count) : (replaceTml.count = 1)
                    break;
                }
            }

            if( replaceTml ){
                const { templateWxmlTree,selectNode } = replaceTml
                // 找到要被替换模版在父组件的位置
                const useTemplateStr = Object.keys(usetml[useTemplateName])[0]
                let templateParent = usetml[useTemplateName][useTemplateStr].parent;
                let templateParentTheChilren = usetml[useTemplateName][useTemplateStr].parent.obj.childs;
                let templatehaschildrenNodeIndex = templateParentTheChilren.indexOf(usetml[useTemplateName])    
                
                // 替换模板的父节点        
                // 注意：这里要做浅拷贝
                templateWxmlTree.forEach(node=>{
                    const key = Object.keys(node)[0]
                    node[key].parent = templateParent
                })

                // 进行替换 
                Array.prototype.splice.apply( templateParentTheChilren,[templatehaschildrenNodeIndex,1,...templateWxmlTree] )

                // 发现找到的第一次找到时合并 后面就没必要合并了 因为都一样 会造成重复
                if( replaceTml.count == 1 ){
                    // 使用它模板或者页面的selectNode 合并和 组件的selectNode
                    mergeSelectNode( mianSelectNodes,selectNode )
                }
            }
        })

        if( !isTemplateWxml ){
            mergeSelectNode( mianSelectNodes,_selectNodes )
        }
        
        resolve( isTemplateWxml ? templateNode : { WxmlTree,selectNodeCache:mianSelectNodes });
    })
}

// 把Wxml字符串转为树结构
const getTemplateWxmlTree = async (temkey,wxmlStr,selectNodes) => {
    // const templates = {};
    // const templateStartRegExp = /\<template.*\>/
    // const templateEndRegExp = /\<\/template.*\>/
    
    // const wxmlStrFindTemplate = (str,finds) => {
    //     finds = finds || [];
    //     let templateName = ''
    //     const templateStartIndex = str.search(templateStartRegExp)
    //     const templateEndIndex = str.search(templateEndRegExp) 

    //     if( templateStartIndex!= -1 && templateEndIndex != -1 ){
    //       let tpl = str.substr(templateStartIndex,templateEndIndex + 11)
    //       str = str.replace(tpl,'')
    //       finds.push({ name:'',tpl:tpl.replace(templateStartRegExp,($1,$2)=>{
    //             templateName = getAttr($1,'name')
    //             return ''
    //       })
    //       .replace(templateEndRegExp,'') })
    //       finds[finds.length-1].name = templateName;
    //       return wxmlStrFindTemplate(str,finds)
    //     }
    //     return finds;
    // }

    // const templateStrArr = wxmlStrFindTemplate(wxmlStr)
    // for( let index = 0,len = templateStrArr.length; index < len ; index++ ){
    //     const templateName = templateStrArr[index].name
    //     debug( templateStrArr[index].name,'<<<<<<<<<<<<<<<<<<<<< templateName >>>>>>>>>>>>>>>>>>>>>' )
    //     const { WxmlTree:templateWxmlTree,selectNodeCache } = await getWxmlTree(templateStrArr[index].tpl,true)
    //     templates[templateName] = {
    //         templateWxmlTree:templateWxmlTree.root.childs,
    //         selectNodeCache
    //     }
    // }

    return await getWxmlTree(wxmlStr,true,selectNodes)
    
}