// 把Wxml字符串转为树结构
// 在转成树结构的过程中就可以把所有节点存储起来
// 标签不会被覆盖 这个核实过了
const path = require('path');
const fsp = require('fs-promise');
const mergeSelectNode = require('./mergeSelectNode');
const getTagName = require('../parseWxml/getTagName');
const getTagClass = require('../parseWxml/getTagClass');
const getId = require('../parseWxml/getId');
const getAttr = require('../parseWxml/getAttr');
const cloneWxmlTree = require('./cloneWxmlTree');
const setSelectNodeCache = require('./setSelectNodeCache');


const componentsClasses = {};

const getTemplateWxmlTree = async (wxmlStr, wxRootPath, pagePath, selectNodes, templatePath) => await getWxmlTree(wxmlStr, wxRootPath, pagePath, true, selectNodes, templatePath);


// 2019-03-21
// selectNodeCache不再作为全局变量 而作为getWxmlTree的返回值
function getWxmlTree(data, wxRootPath, pagePath, isTemplateWxml = false, mianSelectNodes = { __tag__: {} }, templatePath) {
  let pageJson = null;
  let useingComponents = {};
  let wxmlStr = '';

  if (typeof data === 'object') {
    // 如果是页面 data为一个对象
    pageJson = JSON.parse(data.pageJson);
    // 拿到 page的 usingComponents
    useingComponents = pageJson.usingComponents ? pageJson.usingComponents : useingComponents;
    wxmlStr = data.pageWxml;
  } else {
    // 模版则是字符串
    wxmlStr = data;
  }

  // 解决 {{  }} 中使用尖括号会影响截取标签的正则表达式问题
  const hasAngleBracketsReg = /[<>]/g;
  // 这段正则再优化一下使用便可以优化性能  /\{\{(.*[\>\<]{1}.*?)\}\}[\"|\']/
  wxmlStr = wxmlStr.replace(/\{\{.*?\}\}/g, ($1) => {
    if (hasAngleBracketsReg.test($1)) {
      const replacAngleBracjetsTemplateStr = $1.replace(hasAngleBracketsReg, ' @@@block@@@ ');
      return replacAngleBracjetsTemplateStr;
    }
    return $1;
  });

  const templateStartTagReg = /<template.*\s+name=/;
  const useTemplateTagReg = /<template.*\s+is=/;

  // 对已经查找过的节点位置缓存 下次可以直接在这里获取 针对class id
  // 2019-4-8 新增__tag__ 用来存放 tag所有对应标签元素
  let selectNodes = { __tag__: {} };

  // template层数 isTemplateWxml为true时会用到
  let templateCount = 0;

  // 解析模版wxmlTree时 会存在这个对象
  const templateNode = {};
  // 当前处理模板名称
  let currentTemplateName = '';

  // 存放找到的模版
  const findTemplates = {};
  // 模版缓存
  const templateCache = {};
  // 找到的使用模版 反正重名 使用数组
  const findUseTemplates = [];

  // 过滤调pageWxml中的注释
  wxmlStr = wxmlStr.replace(/<!--([\s\S]*?)-->/g, '');

  // Wxml树结构
  let WxmlTree = {
    root: {
      childs: [

      ],
      parent: {
        key: null,
        obj: null,
      },
    },
  };

  let head = WxmlTree.root;
  let parentkey = 'root';

  // 重置Wxml树
  const resetWxmlTree = () => {
    const newWxmlTree = {
      root: {
        childs: [

        ],
        parent: {
          key: null,
          obj: null,
        },
      },
    };
    head = newWxmlTree.root;
    parentkey = 'root';
    selectNodes = { __tag__: {} };
    return newWxmlTree;
  };

  const isSingeTagReg = /<(.*)\/>/;
  const isCloseTagReg = /<\/(.*)>/;
  const isCompleteTagReg = /<.*>.*<.*>/;

  // 是否import标签
  const isImportReg = /import/i;
  // 是否template标签
  const isTemplateReg = /template/i;

  return new Promise(async (resolve, reject) => {
    // 从上到下获取全部标签
    // 注意标签连写情况 如：<view>A</view><view>B</view><view>C</view>
    let match = null;

    const findTemplateWxml = importSrc => new Promise(async (_resolve) => {
      let _templatePath = '';
      // 查找模版规则 首先查找相对路径 如果相对路径没有 则尝试绝对路径 如果都没有则弹出错误 当时不印象继续往下执行
      _templatePath = path.join(isTemplateWxml
        ? templatePath.replace(/\/\w+\.wxml$/, '')
        : pagePath, importSrc);

      fsp.readFile(_templatePath, 'utf-8')
        .catch(() => {
          _templatePath = path.join(wxRootPath, importSrc);
          return fsp.readFile(_templatePath, 'utf-8');
        })
        .catch((err) => {
          console.log(err, 'err');
          console.log('没有找到模版文件 模版地址:', importSrc);
          reject();
        })
        .then(tmp => getTemplateWxmlTree(tmp, wxRootPath, pagePath, mianSelectNodes, _templatePath))
        .then((res) => {
          _resolve(res);
        })
        .catch((err) => {
          console.log('getTemplateWxmlTree执行时遇到错误');
          console.log(err);
          reject();
        });
    });

    while (match = /<[\s\S]*?>/.exec(wxmlStr)) {
      const $1 = match[0];
      wxmlStr = wxmlStr.replace($1, '');

      const tagName = getTagName($1);

      let componentClass = [];
      let tagClass = getTagClass('class', $1);
      // 处理组件的 扩展class
      if (useingComponents[tagName]
          && componentsClasses[tagName]
          && componentsClasses[tagName].length > 0) {
        componentsClasses[tagName].forEach((classKey) => {
          componentClass = componentClass.concat(getTagClass(classKey, $1, [], true));
        });
        tagClass = tagClass.concat(componentClass);
      }

      const tagId = getId($1);

      // /\<\s?\/import/i 这段正则用来防止 </improt> 标签也会进入这块处理
      if (isImportReg.test(tagName) && !/<\s?\/import/i.test($1)) {
        let importSrc = getAttr($1, 'src');
        importSrc = /.*\.wxml$/i.test(importSrc) ? importSrc : `${importSrc}.wxml`;
        findTemplates[importSrc] = findTemplateWxml.bind(null, importSrc);
      }

      if (isTemplateWxml && isTemplateReg.test(tagName)) {
        // 模板包裹 的启始template标签找到
        if (templateStartTagReg.test($1)) {
          ++templateCount;
          currentTemplateName = getAttr($1, 'name');
          templateNode[currentTemplateName] = {
            templateWxmlTree: null,
            selectNode: null,
          };
          continue;
        }
      }

      // 是否单标签
      if (isSingeTagReg.test($1)) {
        // console.log('是单标签')

        const self = {
          [$1]: {
            childs: [],
            class: tagClass,
            id: tagId,
            tag: tagName,
            statrTag: true,
            endTag: true,
            parent: {
              key: parentkey,
              obj: head,
            },
          },
        };

        // 收集使用的模版
        if (useTemplateTagReg.test($1)) {
          findUseTemplates.push({ [getAttr($1, 'is')]: self });
        }
        setSelectNodeCache(self[$1], tagClass, tagId, selectNodes);

        head.childs.push(self);

        continue;
      }

      // 是否闭合标签
      if (isCloseTagReg.test($1)) {
        // console.log('是闭合标签')

        if (isTemplateWxml && isTemplateReg.test(tagName)) {
          --templateCount;
          // 模板包裹 的闭合template标签找到
          if (templateCount === 0) {
            templateNode[currentTemplateName].templateWxmlTree = WxmlTree.root.childs;
            templateNode[currentTemplateName].selectNode = selectNodes;
            WxmlTree = resetWxmlTree();
            continue;
          }
        }

        const isCompleteTag = isCompleteTagReg.test($1);

        // 需找到闭合标签 把指针指向上一层
        if (!isCompleteTag) {
          try {
            // console.log(head)
            parentkey = head.parent.key;
            head = head.parent.obj;
          } catch (e) {
            console.log('完毕标签 head 报错');
            console.log(e);
            return;
          }
        }

        const self = {
          [$1]: {
            childs: [],
            class: tagClass,
            id: tagId,
            tag: tagName,
            statrTag: !!isCompleteTag,
            endTag: true,
            parent: {
              key: parentkey,
              obj: head,
            },
          },
        };

        // 收集使用的模版
        if (useTemplateTagReg.test($1)) {
          findUseTemplates.push({ [getAttr($1, 'is')]: self });
        }

        if (isCompleteTag) {
          // console.log( selectNodes,'selectNodes' )
          setSelectNodeCache(self[$1], tagClass, tagId, selectNodes);
        }

        try {
          // console.log(head)
          head.childs.push(self);
        } catch (e) {
          console.log('闭合标签 head 报错');
          console.log(e);
          return;
        }

        continue;
      }

      // console.log('是起始标签')

      // 不是闭合标签 也不是 单标签 就是启始标签
      const self = {
        [$1]: {
          childs: [],
          class: tagClass,
          id: tagId,
          tag: tagName,
          statrTag: true,
          endTag: false,
          parent: {
            key: parentkey,
            obj: head,
          },
        },
      };

      // 收集使用的模版
      if (useTemplateTagReg.test($1)) {
        findUseTemplates.push({ [getAttr($1, 'is')]: self });
      }

      if (isTemplateWxml && isTemplateReg.test(tagName)) {
        ++templateCount;
      }

      // console.log( selectNodes,'selectNodes' )
      setSelectNodeCache(self[$1], tagClass, tagId, selectNodes);

      try {
        // console.log(head)
        head.childs.push(self);
      } catch (e) {
        console.log('启始标签 head 报错');
        console.log(e);
        return;
      }

      // 把指针指向这个标签
      head = self[$1];
      parentkey = $1;
    }

    // 处理import元素 找到的模板存入到templateCache
    const findTemplateNames = Object.keys(findTemplates);
    for (let i = 0, len = findTemplateNames.length; i < len; i++) {
      const findTemplateName = findTemplateNames[i];
      templateCache[findTemplateName] = await findTemplates[findTemplateName]();
    }

    // 遍历在wxml中找到 带有is属性的template标签
    findUseTemplates.forEach((usetml) => {
      // 准备被替换的模版
      let replaceTml = null;
      const useTemplateName = Object.keys(usetml)[0];

      for (const importTmlPath in templateCache) {
        if (templateCache[importTmlPath][useTemplateName]) {
          replaceTml = templateCache[importTmlPath][useTemplateName];
          replaceTml.count ? (++replaceTml.count) : (replaceTml.count = 1);
          break;
        }
      }

      if (replaceTml) {
        const { templateWxmlTree } = replaceTml;

        // 找到要被替换模版在父组件的位置
        const useTemplateStr = Object.keys(usetml[useTemplateName])[0];
        const templateParent = usetml[useTemplateName][useTemplateStr].parent;
        const templateParentTheChilren = usetml[useTemplateName][useTemplateStr].parent.obj.childs;
        const templatehaschildrenNodeIndex = templateParentTheChilren.indexOf(usetml[useTemplateName]);

        // 替换模板的父节点
        // 注意：这里要做浅拷贝
        const tmpSelectNode = { __tag__: {} };
        const tmpClone = cloneWxmlTree(templateWxmlTree, templateParent, tmpSelectNode);
        // 进行替换
        Array.prototype.splice.apply(
          templateParentTheChilren,
          [templatehaschildrenNodeIndex, 1, ...tmpClone],
        );
        // 发现找到的第一次找到时合并 后面就没必要合并了 因为都一样 会造成重复
        mergeSelectNode(mianSelectNodes, tmpSelectNode);
      }
    });

    if (!isTemplateWxml) {
      mergeSelectNode(mianSelectNodes, selectNodes);
    }

    resolve(isTemplateWxml ? templateNode : { WxmlTree, selectNodeCache: mianSelectNodes });
  });
}

module.exports = getWxmlTree;
