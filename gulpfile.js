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

gulp.task('one',async function(){
    const pageFilePath = path.join( PAGES_PATH,'/addtoptics' );
    const pageFiles = await fsp.readdir( pageFilePath,'utf-8')
    
    let pageWxss = await fsp.readFile( path.join( pageFilePath,pageFiles.find(v=>/\.wxss/.test(v)) ) ,'utf-8' );
    let pageWxml = await fsp.readFile( path.join( pageFilePath,pageFiles.find(v=>/\.wxml/.test(v)) ), 'utf-8' );

    // 获取Wxss中的选择器
    const classSelects = [];
    pageWxss.replace(/([\.|\#].*)\{/g,($1,$2)=>{
        classSelects.push($2);
    })
    
    

    const WxmlTree = getWxmlTree(pageWxml);

    
    
    //遍历出所有节点
    const consoleTree = (tags)=>{
        for( const obj of tags ){
            const keys = Object.keys(obj);
            keys.forEach(key=>{
                if( obj[key].tag.length > 0 ){
                    consoleTree(obj[key].tag)
                }
            })
        }
    }

    // consoleTree(WxmlTree.root.tag)
})

//把Wxml结构转为树结构
const getWxmlTree = (wxmlStr)=>{
        //过滤调pageWxml中的注释
        wxmlStr = wxmlStr.replace(/\<!--(.*)-->/g,'')

        //Wxml树结构
        const WxmlTree = {
            root:{
                tag:[

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

            const TagClass = [];
            const TagId = [];

            // 取得标签内的Class
            const getTagClass = (tag)=>{
                const hasClass = /class/;
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
                        TagClass.concat(classNames.split(" ").filter(v=>v))
                    })

                    // 一些写法不规范的开发者 会写多个class 这里先不管
                    tag = tag.replace(TagClassStr,'');
                    if( hasClass.test(tag) ) { 
                        getTagClass(tag)
                    }
                }
            }

            getTagClass($1);
            
            console.log( TagClass )

            //是否单标签
            if( isSingeTagReg.test($1) ){
                const self = {
                    tag:[],
                    parent:{
                        key:parentkey,
                        obj:head    
                    }
                }
                head.tag.push({
                    [$1]:self
                })
                return; 
            };
    
            //是否闭合标签
            if( isCloseTagReg.test($1) ){
    
                //需找到闭合标签 把指针指向上一层
                if( parentkey != 'root'  ||  !isCompleteTagReg.test($1) ){
                    parentkey = head.parent.key
                    head = head.parent.obj
                }
    
                const self = {
                    tag:[],
                    parent:{
                        key:parentkey,
                        obj:head    
                    }
                }
                head.tag.push({
                    [$1]:self
                })
    
                return;
            }
            
            // console.log('here3')
            //不是闭合标签 也不是 单标签 就是启始标签
            const self = {
                [$1]:{
                    tag:[],
                    parent:{
                        key:parentkey,
                        obj:head
                    }
                }
            }
    
            head.tag.push(self);
            //把指针指向这个标签
            head = self[$1];
       
        }) 

        return WxmlTree;
}


