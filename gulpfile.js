/**
 * @author wzf
 * @deta  2019-03-03
 * @email 373712195@qq.com
 */
const gulp = require('gulp');
const path = require('path');
const plugs = require('./');

// 属性选择器
// 【class】选择带有 target 属性所有元素。
// 【class=value】选择 target="_blank" 的所有元素。
// 【class～=value】选择 title 属性包含单词 "flower" 的所有元素。
// 【class|=value】选择 lang 属性值以 "en" 开头的所有元素。
// 【class^=value】选择其 src 属性值以 "https" 开头的每个 <a> 元素。
// 【class$=value】选择其 src 属性以 ".pdf" 结尾的所有 <a> 元素。
// 【class*=value】选择其 src 属性中包含 "abc" 子串的每个 <a> 元素。

// {{ ['class1','class2'][variable] }} {{ obj[key] }} 暂无处理这种class模版
// 去除无用的动画keyfarm

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

// 2019-5-25
// 兄弟选择器还未处理

// 2019-5-29
// 选择器连用情况 a + a + a 解决
// 微信组件 的扩展class

// 2019-6-1
// app.json 组件引用

// 2019-6-2
// getDynamicClass 发现未处理的情况
// 1、 class="lll{{  }}" 字符串 模版class拼接 ok
// 2、 class="{{ 1 ?  1 ? 1 : 2 : 3 }}" 多个三元 ok
// 3   class="{{ 1 || 2 }}" class="{{ 1 && 2 }}" ok

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
 * ‘/customer_chat’ 检查完毕 没有问题
 * '/discussion' 检查完毕 没有问题
 * '/expertComment' 检查完毕 没有问题
 * ‘/filterCar' 检查完毕 没有问题
 * ’/goPublic‘ 检查完毕 没有问题
 * ’/hotComment‘ 检查完毕 没有问题
 * ’/inquiry‘ 检查完毕 没有问题
 * '/jumpToAsk' 检查完毕 没有问题
 * ‘/locationBrands’ 检查完毕 没有问题
 * '/myorder' 检查完毕 没有问题
 * ‘/myscore’ 检查完毕 没有问题
 * ‘/navBrands’ 检查完毕 没有问题
 * '/navToMiniProgran' 检查完毕 没有问题
 * ‘/news/detail’ 检查完毕 没有问题
 * '/news/list' 检查完毕 没有问题
 * '/participate' 检查完毕 没有问题
 * '/personal_information' 检查完毕 没有问题
 * '/pic' 检查完毕 没有问题
 * '/pkConfig' 检查完毕 没有问题
 * '/promotion' 检查完毕 没有问题
 * '/rank' 检查完毕 没有问题
 * '/rating/list' 检查完毕 没有问题
 * '/rating/post' 检查完毕 没有问题
 * '/receive_preferential' 检查完毕 没有问题
 * '/releaseHeadine' 检查完毕 没有问题
 * 'replybar' 检查完毕 没有问题
 * ‘/scoreDetail/koubeidetail’ 检查完毕 没有问题
 * '/scoreDetail/livedetail'  检查完毕 没有问题
 * '/scoreDetail/longdetail'  检查完毕 没有问题
 * '/scoreDetail/shortdetail' 检查完毕 没有问题
 * '/search'  检查完毕 没有问题
 * '/search-lists' 检查完毕 没有问题
 * '/smallHeadBand' 检查完毕 没有问题
 * '/specialColumn' 检查完毕 没有问题
 * '/style' 检查完毕 没有问题
 * '/styleConfig' 检查完毕 没有问题
 * '/styleDetail' 检查完毕 没有问题
 * '/topSellCars' 检查完毕 没有问题
 * 'updatePhone' 检查完毕 没有问题
 * '/user/center' 检查完毕 没有问题
 * '/user/detail' 检查完毕 没有问题
 * '/video' 检查完毕 没有问题
 * ‘/videoDetail’ 检查完毕 没有问题
 * ‘/videoTags’ 检查完毕 没有问题
 * '/webView' 检查完毕 没有问题
 * '/weInquiry' 检查完毕 没有问题
 *
 * ’/index‘ 检查完毕 没有问题
 * ‘/detail’太复杂 优先级放到最后
 * '/configuration' 太复杂 优先级放到最后 不过应该是没问题
 *
 */

// .wenwen-block .ask-list .ask-item .reward ~ text
// const PAGE_DIR_PATH = '/test';
// const PAGE_DIR_PATH = '/video'
// const PAGE_DIR_PATH = '/test'
// 用来收集css变量 开发时使用
const _cssVariable = new Set();

// 未来 config 参数
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
  // tabBtnCurrentIndex:[1,2,3]

  // discussion
  // 'item.colorCls':['themered']

  // /scoreDetail/shortdetail
  // 'shortComments[0].colorCls':['themered']

  // /search-lists
  // 'android':['android']

  // /styleConfig
  // 'innerItem.cls':['same']

  // /topSellCars
  // 'index+1':[1,2,3]

};
// 未来 config 参数
// const componentsClasses = {
//   'c-tab-item': ['tab-item-class', 'tab-item-active-class'],
//   'c-bottom-nav': ['bottomnav-button-class', 'bottomnav-icon-animated', 'bottomnav-icon-text-class', 'bottomnav-icon-class'],
//   'c-model': ['model-class', 'model-content-class', 'model-success-btn-class', 'model-cancel-btn-class'],
// };

gulp.task('one', async () => {
  console.log(plugs, 'plugs');
  gulp.src('./wx/wcjs_wx_miniprogram/pages/**/**.wxss')
    .pipe(plugs({
      log: true,
      wxRootPath: path.join(__dirname, '/wx/wcjs_wx_miniprogram'),
      cssVariable: {
        'index+1': [1, 2, 3],
      },
      componentsClasses: {
        'c-bottom-nav': ['bottomnav-button-class', 'bottomnav-icon-animated', 'bottomnav-icon-text-class', 'bottomnav-icon-class'],
        'c-model': ['model-class', 'model-content-class', 'model-success-btn-class', 'model-cancel-btn-class'],
      },
    }))
    .pipe(gulp.dest('./dest'));
});
