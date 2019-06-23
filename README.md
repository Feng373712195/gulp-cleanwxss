# gulp-replace [![NPM version][npm-image]][npm-url]
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

gulp.task('clean-wxss', function(){
  gulp.src('wcjs_wx_miniprogram/pages/**/**.wxss')
    .pipe(cleanwxss())
    .pipe(gulp.dest('build/'));
});
```

## gulp-cleanwxss options

An optional third argument, `options`, can be passed.

#### options
Type: `Object`

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
  gulp.src('wcjs_wx_miniprogram/pages/**/**.wxss')
    .pipe(cleanwxss({
        componentsClasses:{
            'my-class':['classname1','classname2']
        }
    }))
    .pipe(gulp.dest('build/'));
});
```

微信自带组件中的外部样式类无需额外配置

```javascript
var cleanwxss = require('gulp-cleanwxss');

gulp.task('clean-wxss', function(){
  gulp.src('wcjs_wx_miniprogram/pages/**/**.wxss')
    .pipe(cleanwxss({
        cssVariable:{
            classname:['box','mask']
        }
    }))
    .pipe(gulp.dest('build/'));
});
```


[npm-url]: https://npmjs.org/package/gulp-replace
[npm-image]: https://badge.fury.io/js/gulp-replace.svg