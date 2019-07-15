# gulp-cleanwxss [![NPM version][npm-image]][npm-url]
> 清除微信小程序wxss文件中不使用的class

## Usage

首先，安装gulp-cleanwxss作为开发依赖项：

```shell
npm install --save-dev gulp-cleanwxss
```

然后添加到 `gulpfile.js`:

### Example
```javascript
var cleanwxss = require('gulp-cleanwxss');

gulp.task('clean-wxss', function(done){
  gulp.src('wcjs_wx_miniprogram/pages/**/**.wxss')
    .pipe(cleanwxss())
    .pipe(gulp.dest('build/'));
    
    // cleanwxss为异步处理 需要触发done来通知gulp任务已经结束
    done();
});
```

## gulp-cleanwxss options

#### options
Type: `Object`

##### options.log
Type: `Boolean`  
Default: `false`

如果设置true 在执行gulp任务时会打印一些信息提供给开发者：

PageUseTmplate: 页面中使用到的模板名字

CssVariables: 页面中使用到的CSS变量

Delete:插件删除掉的样式选择器

##### options.wxRootPath
Type: `String`  
Default: `‘’`

微信小程序根目录的位置，如果没有传则默认使用调用gulp时目录的位置

##### options.cssVariable
Type: `Object`  
Default: `{}`

如果你在class中使用到了模版变量 如 class=“{{ classname }}”,请配置这个参数：

```javascript
var cleanwxss = require('gulp-cleanwxss');

gulp.task('clean-wxss', function(){
  gulp.src('wcjs_wx_miniprogram/pages/**/**.wxss')
    .pipe(cleanwxss({
        cssVariable:{
            variablename:['classname1','classname2']
        }
    }))
    .pipe(gulp.dest('build/'));
});
```

##### options.componentsClasses
Type: `Object`  
Default: `{}`


如果你的微信小程序页面中使用的自定义组件配置了外部样式类：
```javascript
Component({
  externalClasses: ['my-class']
})
```

请配置这个参数：

```javascript
var cleanwxss = require('gulp-cleanwxss');

gulp.task('clean-wxss', function(){
  gulp.src('wx_miniprogram/pages/**/**.wxss')
    .pipe(cleanwxss({
        componentsClasses:{
            'my-class':['classname1','classname2']
        }
    }))
    .pipe(gulp.dest('build/'));
});
```

微信自带组件中的外部样式类无需额外配置


[npm-url]: https://npmjs.org/package/gulp-cleanwxss
[npm-image]: https://badge.fury.io/js/gulp-cleanwxss.svg