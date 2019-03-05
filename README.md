1111
<!-- 特殊字体引用 -->
font-family: 'Impact';


小程序资源:

微信小程序开发资源汇总: https://github.com/justjavac/awesome-wechat-weapp
官方文档: https://mp.weixin.qq.com/debug/wxadoc/dev/index.html
官方设计指南: https://mp.weixin.qq.com/debug/wxadoc/design/index.html

```
├── /assets/                    # 资源目录
│   ├── /fonts/                 # icon fonts
│   ├── /images/                # 图片库
│
├── /node_module/               # babel, expect... 等单元测试小工具
│
├── /pages/                     # 页面
│   ├── /sample/
│       ├── /sample.js          # 页面js
│       ├── /sample.wxml        # 页面结构
│       ├── /sample.wxss        # 页面样式
│
├── /style/                     # 公用css样式
├── /test/                      # 单元测试
├── /tmpl/                      # 模板目录
├── /utils/                     # 公用、工具类 js
├── .babelrc                    # babel配置文件 (主要给单元测试的)
├── .editorconfig               # 编辑器格式规范配置文件
├── .eslintrc.js                # eslint js格式化配置文件
├── .gitignore                  # git忽略配置
├── app.js                      # 小程序脚本代码 (生命周期函数、声明全局变量等)
├── app.json                    # 小程序全局配置
├── app.wxss                    # 小程序全局样式
├── package.json                # (主要给单元测试的)
├── README.md                   # 项目简介 (资源、结构、常见问题、使用方法等)
├── rules.wxss                  # 小程序设计规范
```


微信小程序常见问题:

    1.wxss不能使用变量
    2.sass等不能使用
    3.icon暂时 用 class="icon icon-close"
    4.multiple-white-block样式的margin-top如果和顶部导航条挨着的情况下，会从灰色变成白色
    5.input样式无法定义
    6.showToast异步调用两层失效

小程序单元测试:
    /* ==================================
     *  使用方法
     * ================================== */
    $ npm test

小程序eslint js格式化:
    /* ==================================
     *  使用方法
     * ================================== */
    $ npm run lint
注意: 平时不要直接运行上面这句，最好运行"./node_modules/.bin/eslint 你做的js目录或文件 --fix || true"

小程序模板
    /* ==================================
     *  模版基本使用方法
     * ================================== */
    <import src=""  />
    <template is="" data="{{}}"/>
    <template name=""></template>

    /* ==================================
     * loader使用
     * ================================== */
    data: {
        initLoader: true
    },
    onLoad: function() {
        api.request({
          url: '/trade/api/brands',
          success: (res)=> {
            this.setData({
                initLoader: false
            });
          }
        })
    }
    <import src="/tmpl/loader/loader.wxml" />
    <template wx:if="{{initLoader}}" is="loader" />

    /* ==================================
     * list-view使用 引入和相关数据
     * ================================== */
    testData: [
        {
            iconLeft: 'icon-left',
            textMid: '第一条list',
            iconRight: 'icon-right'
        },
        {
            iconLeft: '',
            textMid: '第二条list',
            iconRight: ''
        },
        {
            iconLeft: '',
            textMid: '第三条list',
            iconRight: ''
        },
        {
            iconLeft: '',
            textMid: '第四条list',
            iconRight: ''
        },
        {
            iconLeft: '',
            textMid: '第五条list',
            iconRight: ''
        },
        ]
    <import src="../../tmpl/listView/listView.wxml" />
    <template is="singelList" data="{{ testData }}" />



    /* ==================================
     * tab使用 引入和相关数据
     * ================================== */
    在使用模板的页面的JS文件需要传入以下：
    数据：
    tabList: {
                tabIndex: '0',
                tabItems: [],
                tabAnimationData: {},
                bindtap: 'changeTab',
                scrollLeft: 0
            },
    函数：
    changeTab: function(e){
        tab(this, e);
        //当前页面需要添加的事件
    },

    说明：
    tabIndex是页面默认样式为active的选项
    tabItems是存放tab名字的数组,根据数量不同，分2种情况
    tabAnimationData是绑定的动画
    bindtap是绑定的点击触发函数可根据需要在后面自行添加事件
    scrollLeft是多个tab的情况下默认的滚动条位置

    注意：
        在你使用的当前页面，需要需要修改tabList里面的某个数据，setData的时候应如下:
        this.setData({
            tabList:{
                tabIndex: id, //需要修改的数据
                tabItems: this.data.tabList.tabItems, //不需要修改的数据
                ...
                ...
                ...
            }
        })

    使用：

    在wxml文件的开头引入：
    <import src="../../tmpl/tab/tab.wxml" />

    在JS文件开头引入：
    var tab = require('../../utils/tab');

    在需要使用模板的代码位置引入：
    <template is="tab" data="{{ tabList }}" />


    在tab数量<4的时候，如果需要使用动画切换效果的页面内容可以写在以下的结构内（样式可以自行删除, .each-tab的数量可根据tab数量循环生成）：
    <view id="tab-animation-wrapper">
         <view class="tab-translate-inner" animation="{{animationData}}" >
            <view class="each-tab" style="background:red;">
                第一个切换的tab
            </view>
            <view class="each-tab" style="background:yellow;">
                第二个切换的tab
            </view>
            <view class="each-tab" style="background:#000;">
                第三个切换的tab
            </view>
         </view>
     </view>




/* ==================================
     * scroll-image-img使用 引入和相关数据
     * ================================== */
    在使用模板的页面的JS文件需要传入以下：
    数据：
    scrollImage: {
        imgList: [
            '/assets/images/header.jpg',
            '/assets/images/header.jpg',
            '/assets/images/header.jpg',
            '/assets/images/header.jpg',
            '/assets/images/header.jpg',
            '/assets/images/header.jpg',
            '/assets/images/header.jpg',
        ], //必选
        indicatorDots: false, //必选，swiper组件自带的默认属性
        autoplay: false, //必选，swiper组件自带的默认属性
        interval: 5000, //必选，swiper组件自带的默认属性
        duration: 1000, //必选，swiper组件自带的默认属性
        search: true, //可选，需要左上角的搜索功能可以传入true，不需要就不传或者false
        bottomLine: true, //可选，底部的短横线滑动功能，不需要可以不传或者false
        animationData: {}, //可选，底部横线滑动的绑定动画函数，不需要可以不传
        height: 500   //可选，图片的高度，默认或者不传为500，单位是rpx
    }

    函数：
    headerScroll(e){
        var that = this;
        doScroll(e, that);
        //当前页面的其他事件可以写在后面
    },

    使用：

    在wxml文件的开头引入：
    <import src="../../tmpl/scroll-header-img/scroll-header-img.wxml" />

    在需要使用模板的代码位置引入：
    <template is="scroll-header-img" data="{{ scrollImage }}" ></template>

    在JS文件开头引入：
    var doScroll = require('../../tmpl/scroll-header-img/scroll-header-img.js');




/* ==================================
     * icon-list使用 引入和相关数据
     * ================================== */
    在使用模板的页面的JS文件需要传入以下：
    数据：
    iconList:[
        {
            icon: '/assets/icons/brand-w.png',
            title: '品牌选车',
            url: '/pages/index/index',

        },
        {
            icon: '/assets/icons/condition-w.png',
            title: '条件选车',
            url: '/pages/index/index'
        },
        {
            icon: '/assets/icons/cal-w.png',
            title: '购车计算',
            url: '/pages/index/index'
        },
        {
            icon: '/assets/icons/pk-w.png',
            title: '车型对比',
            url: '/pages/index/index'
        }
    ],

    使用：

    在wxml文件的开头引入：
    <import src="../../tmpl/icon-list/icon-list.wxml" />

    在需要使用模板的代码位置引入：
    <template is="icon-list" data="{{ iconList}}" ></template>



/* ==================================
     * box-header使用 引入和相关数据
     * ================================== */
    在使用模板的页面的JS文件需要传入以下：
    数据：
    boxHeaderData: {
        hotCar: {
            leftText: '热门车型',
            //more是可选的
            more:{
                has: true,
                url: '/pages/index/index'
            }
        }
    },
    注意: 传入的数据结构根据你自己需要可以改写，只需要对象包括相关属性

    使用：

    在wxml文件的开头引入：
   <import src="../../tmpl/box-header/box-header.wxml" />

    在需要使用模板的代码位置引入：
    <view class="white-block multiple-white-block left-padding">
        <template is="box-header" data="{{ ...boxHeaderData.hotCar }}" ></template>
    </view>



/* ==================================
     * scroll-image使用 引入和相关数据
     * ================================== */
    在使用模板的页面的JS文件需要传入以下：
    数据：
    hotCar: {
        list: [
                {
                    img: '/assets/images/h-1.png',
                    title: '凯美瑞',
                    score: '8.9',
                    url: '/pages/index/index'
                },
                {
                    img: '/assets/images/h-2.png',
                    title: '法拉利',
                    score: '3.5',
                    url: '/pages/index/index'
                },
                {
                    img: '/assets/images/h-1.png',
                    title: '宝马X5',
                    score: '9.9',
                    url: '/pages/index/index'
                },
                {
                    img: '/assets/images/h-2.png',
                    title: '奔驰S600',
                    score: '6.9',
                    url: '/pages/index/index'
                },
                {
                    img: '/assets/images/h-1.png',
                    title: '兰博基尼',
                    score: '1.9',
                    url: '/pages/index/index'
                }
            ]
    },


    使用：

    在wxml文件的开头引入：
    <import src="../../tmpl/scroll-image/scroll-image.wxml" />

    在需要使用模板的代码位置引入：
    <template is="scroll-image" data="{{ hotCar }}" ></template>

    注意： 图片的大小请用CSS覆盖修改，底部的文字内容，目前只支持2行，如需更多可以修改组件



/* ==================================
     * border-car-list使用 引入和相关数据
     * ================================== */
    在使用模板的页面的JS文件需要传入以下：
    数据：
    worthCar:{
        list: [
            {
                img: 'http://chemm.oss-cn-hangzhou.aliyuncs.com/201607/57834bafd5bbf.jpg',
                title: '2015款 凯美瑞',
                price: 19.28,
                url: '/pages/index/index'
            },
            ...
            ...
        ]
    },


    使用：

    在wxml文件的开头引入：
    <import src="../../tmpl/border-car-list/border-car-list.wxml" />

    在需要使用模板的代码位置引入：
    <template is="border-car-list" data="{{ ...worthCar }}" ></template>



/* ==================================
     * star 使用 引入和相关数据
     * ================================== */
    在使用模板的页面的JS文件需要传入以下：
    数据：
    starData:{
            click: true, //可选，为true的时候可以点击
            score: 0.0, //必选，默认的初始分数值
            finIndex: 0, //必选， 控制最终显示几个星星的变量
            starSize: 30, //可选， 默认的星星大小 30rpx
            fontSize: 30  //可选, 默认的字体大小 30rpx
        }

    使用：
    分3种情况：
    1.不需要点击打分的时候，需要在使用模板之前舒适化传入的数据，方法如下：

    在JS文件开头引入：
    var Star = require('../../tmpl/star/star');

    onLoad()或者onShow()，或者你在当前页面动态改变传入的分数时候，可以调用如下函数：

    changeStar(this.data.starData, this);

    在wxml文件的开头引入：
    <import src="../../tmpl/star/star.wxml" />

    在需要使用模板的代码位置引入：
    <template is="star" data="{{ starData }}" ></template>

    2.需要动态打分的情况

    在JS文件开头引入：
    var Star = require('../../tmpl/star/star');

    页面函数：
    score(e){
        doScore(e, this);
    }

    在wxml文件的开头引入：
    <import src="../../tmpl/star/star.wxml" />

    在需要使用模板的代码位置引入：
    <template is="star" data="{{ starData }}" ></template>

    3.需要多次打分的情况
    数据：
    manyStarData: [
        {
            id: 1, //必选
            finIndex: 0, //必选
            score: 0.0, //可选
            starSize: 60, //可选
            fontSize: 60 //可选
        },
        {
            id: 2, //必选
            finIndex: 0, //必选
            score: 0.0, //可选
            starSize: 60, //可选
            fontSize: 60 //可选
        },
    ],


    在JS文件开头引入：
    var Star = require('../../tmpl/star/star');

    页面函数：
    score(e){
        doScore(e, this);
    }

    在wxml文件的开头引入：
    <import src="../../tmpl/star/star.wxml" />

    在需要使用模板的代码位置引入：
    多次引用按照数据里面的manyStarData传递相应的数据
    <template is="star" data="{{ ...mangStarData[index] }}" ></template>



    /*  ====================================
     *  listView里面 -- <template name="multiLineText > 多行列表
     *  ==================================== */
    testData:[
        {
            outfit:'A',
            multiLines:[
            {
                indexPath:'1',
                name:'A里面第一条数据',
                TextClass:'6挡双离合',
                tapEvent:'PopView',     //每行的点击事件函数
                money:'43.12',
            },
            {
                indexPath:'2',
                name:'A里面第二条数据',
                TextClass:'6挡双离合',
                tapEvent:'PopView',
                money:'53.62'
            },
            {
                indexPath:'3',
                name:'A里面第三条数据asdasdasdasdsasdasdas',
                TextClass:'6挡双离合',
                tapEvent:'PopView',
                money:'167.35'

            }]
        },
        {
            outfit:'B',
            multiLines:[
            {
                indexPath:'4',
                name:'A里面第一条数据',
                TextClass:'6挡双离合',
                tapEvent:'PopView',
                money:'37.45'
            },
            {
                indexPath:'5',
                name:'B里面第二条数据',
                TextClass:'6挡双离合',
                tapEvent:'PopView',
                money:'93.31'
            },
            {
                indexPath:'6',
                name:'B里面第三条数据',
                TextClass:'6挡双离合',
                tapEvent:'PopView',
                money:'67.35'
            }
            ]
        }
    ]
  },
    <import src="../../tmpl/listView/listView.wxml" />
    <template is="multiLineText" data="{{ testData }}" />


    /*  ====================================
     *  注意： 样式是自己写的，可能和官方的不一致
     *  weui cell使用方法
     *  ==================================== */
```
带箭头的
<view class="weui-cells">
    <view class="weui-cell weui-cell_access">
        <view class="weui-cell__bd">基本费用:</view>
        <view class="weui-cell__ft"></view>
    </view>
    <view class="weui-cell weui-cell_access">
        <view class="weui-cell__bd">商业保险:</view>
        <view class="weui-cell__ft">说明文字</view>
    </view>
</view>
不带箭头的
<view class="weui-cells">
    <view class="weui-cell">
        <view class="weui-cell__hd"><view class="icon icon-close"></view></view>
        <view class="weui-cell__bd">标题</view>
        <view class="weui-cell__ft">desc</view>
    </view>
</view>
两行下面一行是小文字
<view class="weui-cell weui-cell_access">
    <view class="weui-cell__hd">
    </view>
    <view class="weui-cell__bd weui-cell__bd-hint">第一行
        <view class="hint">第二行</view>
    </view>
    <view class="weui-cell__ft"></view>
</view>
```


/*  ====================================
 *  操作结果
 *  ==================================== */

 <import src="../../tmpl/result/result.wxml" />
 <template is="result" data="{{...result}}"/>

<!-- 数据大概长这样: -->
result: {
    action: "xx操作成功",
    msg: '内容详情',
    btns:[
        {
            name: '按钮1',
            type: 'warn'
        },
        {
            name: '按钮2',
            type: 'primary'
        },
    ]
}

<!-- 按钮处理按数组顺序 添加  哇哈哈~ -->

handlebtn(e){
    let index = +e.currentTarget.dataset.index;
    let func = [
        ()=>{
            wx.showModal({
              title: '提示',
              content: '处理按钮1',
              success: (res)=> {
                if (res.confirm) {
                    console.log('用户点击确定')
                }
              }
            })
        },
        ()=>{
            wx.showModal({
              title: '提示',
              content: '处理按钮2',
                success: function(res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                }
              }
            })
        }
    ];
    func[index]();
}

/*  ====================================
 *  end
 *  ==================================== */




/*  ====================================
*  车型列表  car-model-list
*  ==================================== */

<import src="/tmpl/car-model-list/car-model-list.wxml" />
<template is="car-model-list" data="{{carModellist}}" />
carModellist:[
    showbtn: true, //是否展示按钮
    list: {
        name: "福克斯(进口)",
        price: "25.98-39.90万",
        thumb: "",
        status: 1    //  有按钮的状态
    }
]
// 到详情页函数
toDetail(e) {
    let id = e.currentTarget.dataset.id;
    app.globalData.style_id = id;
    wx.navigateTo({
        url: `/pages/detail/detail?style_id=${id}`
    })
}

/*  ====================================
*  车型列表  end
*  ==================================== */

丹丹


/*  ====================================
*  自定义遮罩层 非模板
*  ==================================== */
<view catchtap="hideMask" class="mask" wx:if="{{showMask}}">
    <view catchtap="showMask"  class="mask-dialog">

    </view>
</view>

hideMask() {
    this.setData({ showMask: false })
},
showMask() {
    this.setData({ showMask: true })
},

/*  ====================================
*  车型列表  end
*  ==================================== */
