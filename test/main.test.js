const fs = require('fs');
const path = require('path');
const File = require('vinyl');
const cleanWxss = require('../');

const wxssFile1 = new File({
  path: 'test/testWx/pages/page-1/index.wxss',
  contents: Buffer.from(fs.readFileSync('test/testWx/pages/page-1/index.wxss')),
});

test('cleanWxss', (done) => {
  const stream = cleanWxss({
    wxRootPath: path.join(__dirname, '/testWx'),
    cssVariable: {
      cssvariable1: ['v-d1'],
      cssvariable2: ['v-'],
      cssvariable3: ['1'],
      cssvariable4: ['test'],
      cssvariable5: ['test'],
      cssvariable6: ['v-f1'],

      cssvariable7: ['f2'],
      cssvariable8: ['f3'],
      cssvariable9: ['f4'],
      cssvariable10: ['f5'],

      // test ||符号
      cssvariable11: ['g1'],
      cssvariable12: ['g2'],
      cssvariable13: ['g3'],
      // test &&符号
      cssvariable14: ['g4'],
      cssvariable15: ['g5'],
      cssvariable16: ['g6'],
      // test 三元表达式中 || 与 && 符号
      cssvariable17: ['g7'],
      cssvariable18: ['g8'],
      cssvariable19: ['g10'],
      cssvariable20: ['g11'],

      /* 对象或者数组 暂时处理方式 */
      "['h1','h2','h3'][1]": ['h1', 'h2', 'h3'],
      "['h4','h5','h6']": ['h4', 'h5', 'h6'],
      'classes[1]': ['h7'],
      "obj['k1']": ['h8'],
    },
    /* 自定义组件扩展class */
    componentsClasses: {
      component1: ['custom-class'],
      component2: ['custom-class'],
    },
  });
  stream.write(wxssFile1);
  stream.once('data', (file) => {
    console.log(String(file.contents), 'file');

    // 获取清除完class的wxss
    const cleanedFile = String(file.contents);
    // 获取Wxss中的选择器
    const classSelects = [];
    // 获取clss id 标签选择器
    cleanedFile.replace(/([.|#|\w+|[].*)\{/g, ($1, $2) => {
      classSelects.push($2);
    });

    const checkSelectQuery = query => (classSelects.findIndex(item => item === query) !== -1);
    // test single 选择器
    expect(checkSelectQuery('.a1')).toBeTruthy();
    expect(checkSelectQuery('.n-a1')).toBeFalsy();

    // test id选择器
    expect(checkSelectQuery('#a1')).toBeTruthy();
    expect(checkSelectQuery('#n-a1')).toBeFalsy();
    expect(checkSelectQuery('#a1 .a2 #a3')).toBeTruthy();
    expect(checkSelectQuery('#a1 .a2 #n-a3')).toBeFalsy();

    // test 标签选择器选择器
    expect(checkSelectQuery('image')).toBeTruthy();
    expect(checkSelectQuery('n-image')).toBeFalsy();
    expect(checkSelectQuery('#a1 .a2 image')).toBeTruthy();
    expect(checkSelectQuery('#a1 .a2 n-image')).toBeFalsy();

    // 自定义标签
    expect(checkSelectQuery('customTag')).toBeTruthy();

    // test a b 选择器
    expect(checkSelectQuery('.a1 .a3')).toBeTruthy();
    expect(checkSelectQuery('.a1 .n-a3')).toBeFalsy();
    // test a>b 选择器
    expect(checkSelectQuery('.a1>.a2')).toBeTruthy();
    expect(checkSelectQuery('.a1>.n-a2')).toBeFalsy();
    // test a+b 选择器
    expect(checkSelectQuery('.a3+.a3')).toBeTruthy();
    expect(checkSelectQuery('.a3+.n-a3')).toBeFalsy();

    // test 多个选择器
    expect(checkSelectQuery('.a1 .a3,.a1>.a2,.a3+.a3')).toBeTruthy();
    expect(checkSelectQuery('.a1 #a3,.a1>#a2,.a3+#a3')).toBeTruthy();
    expect(checkSelectQuery('#a1 #a3,#a1>#a2,#a3+#a3')).toBeTruthy();

    // test 同级选择器
    expect(checkSelectQuery('.d1.d2 .d3.d4>.d5.d6')).toBeTruthy();

    // test 混用选择器
    expect(checkSelectQuery('.a1 .a2>.a3+.a3')).toBeTruthy();
    expect(checkSelectQuery('.a1 .a2>.a3+.n-a3')).toBeFalsy();

    /* test 修改模板样式 */
    expect(checkSelectQuery('.b1 .tmp1-a1')).toBeTruthy();
    expect(checkSelectQuery('.c1 .tmp1-a1')).toBeTruthy();

    /* test 修改模板样式  a b 选择器 */
    expect(checkSelectQuery('.b1 .tmp1-a1 .tmp1-a3')).toBeTruthy();
    expect(checkSelectQuery('.b1 .tmp1-a1 .n-tmp1-a3')).toBeFalsy();
    expect(checkSelectQuery('.c1 .tmp1-a1 .tmp1-a3')).toBeTruthy();
    expect(checkSelectQuery('.b1 .tmp1-a1 .n-tmp1-a3')).toBeFalsy();

    /* test 修改模板样式  a>b 选择器 */
    expect(checkSelectQuery('.b1 .tmp1-a1>.tmp1-a2')).toBeTruthy();
    expect(checkSelectQuery('.b1 .tmp1-a1>.n-tmp1-a2')).toBeFalsy();
    expect(checkSelectQuery('.c1 .tmp1-a1>.tmp1-a2')).toBeTruthy();
    expect(checkSelectQuery('.b1 .tmp1-a1>.n-tmp1-a2')).toBeFalsy();

    /* test 修改模板样式  a+b 选择器 */
    expect(checkSelectQuery('.b1 .tmp1-a3+.tmp1-a3')).toBeTruthy();
    expect(checkSelectQuery('.b1 .tmp1-a3+.n-tmp1-a3')).toBeFalsy();
    expect(checkSelectQuery('.c1 .tmp1-a3+.tmp1-a3')).toBeTruthy();
    expect(checkSelectQuery('.c1 .tmp1-a3+.n-tmp1-a3')).toBeFalsy();

    /* test 修改模板样式 混用选择器 */
    expect(checkSelectQuery('.b1 .tmp1-a1 .tmp1-a2>.tmp1-a3+.tmp1-a3')).toBeTruthy();
    expect(checkSelectQuery('.b1 .tmp1-a1 .tmp1-a2>.tmp1-a3+.n-tmp1-a3')).toBeFalsy();
    expect(checkSelectQuery('.c1 .tmp1-a1 .tmp1-a2>.tmp1-a3+.tmp1-a3')).toBeTruthy();
    expect(checkSelectQuery('.c1 .tmp1-a1 .tmp1-a2>.tmp1-a3+.n-tmp1-a3')).toBeFalsy();

    /* test 动态渲染class */
    expect(checkSelectQuery('.v-d1')).toBeTruthy();
    expect(checkSelectQuery('.d1.v-d1')).toBeTruthy();
    expect(checkSelectQuery('.test-warp1 .d1.v-d1 .test-box1')).toBeTruthy();
    expect(checkSelectQuery('.test-warp1 .d1.v-d1>.test-box1')).toBeTruthy();
    expect(checkSelectQuery('.test-warp1 .d1.v-d1+.d1')).toBeTruthy();

    /* test 动态拼接class */
    expect(checkSelectQuery('.v-e1')).toBeTruthy();
    expect(checkSelectQuery('.e-test')).toBeTruthy();
    expect(checkSelectQuery('.test-e')).toBeTruthy();
    expect(checkSelectQuery('.header-testcool-e')).toBeTruthy();

    /* test 三元表达式 */
    expect(checkSelectQuery('.v-f1')).toBeTruthy();
    expect(checkSelectQuery('.test-warp3 .v-f1 .test-box3')).toBeTruthy();
    expect(checkSelectQuery('.test-warp3 .v-f1>.test-box3')).toBeTruthy();
    expect(checkSelectQuery('.test-warp3 .v-f1+.f1')).toBeTruthy();

    /* test 嵌套三元表达式 */
    expect(checkSelectQuery('.f1,.f2,.f3,.f4,.f5')).toBeTruthy();

    /* test || 符号 */
    expect(checkSelectQuery('.g1')).toBeTruthy();
    expect(checkSelectQuery('.g2')).toBeTruthy();
    expect(checkSelectQuery('.g3')).toBeTruthy();

    /* test && 符号 */
    expect(checkSelectQuery('.g4')).toBeTruthy();
    expect(checkSelectQuery('.g5')).toBeTruthy();
    expect(checkSelectQuery('.g6')).toBeTruthy();

    /* test 三元表达式中 || 与 && 符号 */
    expect(checkSelectQuery('.g7')).toBeTruthy();
    expect(checkSelectQuery('.g8')).toBeTruthy();
    expect(checkSelectQuery('.g9')).toBeTruthy();
    expect(checkSelectQuery('.g10')).toBeTruthy();
    expect(checkSelectQuery('.g11')).toBeTruthy();
    expect(checkSelectQuery('.g12')).toBeTruthy();

    /* 对象或者数组 */
    expect(checkSelectQuery('.h1')).toBeTruthy();
    expect(checkSelectQuery('.h2')).toBeTruthy();
    expect(checkSelectQuery('.h3')).toBeTruthy();
    expect(checkSelectQuery('.h4')).toBeTruthy();
    expect(checkSelectQuery('.h5')).toBeTruthy();
    expect(checkSelectQuery('.h6')).toBeTruthy();
    expect(checkSelectQuery('.h7')).toBeTruthy();
    expect(checkSelectQuery('.h8')).toBeTruthy();

    /* 默认组建扩展class */
    expect(checkSelectQuery('.button-hover')).toBeTruthy();
    expect(checkSelectQuery('.view-hover')).toBeTruthy();
    expect(checkSelectQuery('.input-placeholder')).toBeTruthy();
    expect(checkSelectQuery('.picker-indicator')).toBeTruthy();
    expect(checkSelectQuery('.picker-mask')).toBeTruthy();
    expect(checkSelectQuery('.slider-selected')).toBeTruthy();
    expect(checkSelectQuery('.textarea-placeholder')).toBeTruthy();
    expect(checkSelectQuery('.navigator-hover')).toBeTruthy();
    /* 组件扩展class */
    expect(checkSelectQuery('.component1-class')).toBeTruthy();
    expect(checkSelectQuery('.component2-class')).toBeTruthy();
    expect(checkSelectQuery('.component3-class')).toBeFalsy();

    /* 测试注释 */
    expect(checkSelectQuery('.i1')).toBeFalsy();
    expect(checkSelectQuery('.i2')).toBeFalsy();
    expect(checkSelectQuery('.i3')).toBeFalsy();
    expect(checkSelectQuery('.i4')).toBeFalsy();

    /* 单属性选择器测试 */
    expect(checkSelectQuery('[class]')).toBeTruthy();

    /* ^= */
    expect(checkSelectQuery('[class^=q1]')).toBeTruthy();

    /* ~= */
    expect(checkSelectQuery('[class~=q2]')).toBeTruthy();
    expect(checkSelectQuery('[class~=q3]')).toBeFalsy();

    /* != */
    expect(checkSelectQuery('[class|=q4]')).toBeTruthy();
    expect(checkSelectQuery('[class|=q5]')).toBeTruthy();
    expect(checkSelectQuery('[class|=q6]')).toBeFalsy();

    /* $= */
    expect(checkSelectQuery('[class$=q7]')).toBeTruthy();

    /* *= */
    expect(checkSelectQuery('[class*=q8]')).toBeTruthy();
    expect(checkSelectQuery('[class*=q9]')).toBeTruthy();

    /* = */
    expect(checkSelectQuery('[class=q10]')).toBeTruthy();

    /* 同级选择器 包含属性选择器 */
    expect(checkSelectQuery('[class^=j1].j2[class$=j3]')).toBeTruthy();
    expect(checkSelectQuery('[class^=j1]#j2[class$=j3]')).toBeTruthy();
    expect(checkSelectQuery('[class^=j1]view[class$=j3]')).toBeTruthy();

    expect(checkSelectQuery('[class^=j4][class~=j5].j6')).toBeTruthy();
    expect(checkSelectQuery('[class^=j4][class~=j5]#j6')).toBeTruthy();
    expect(checkSelectQuery('[class^=j4][class~=j5]view')).toBeTruthy();

    expect(checkSelectQuery('.j7[class~="j8"][class$="j9"]')).toBeTruthy();
    expect(checkSelectQuery('#j7[class~="j8"][class~="j9"]')).toBeTruthy();
    expect(checkSelectQuery('view[class~="j8"][class$="j9"]')).toBeTruthy();

    /* 属性选择器测试 */
    expect(checkSelectQuery('.k1 [class^="k2"][class~="k3"] .k4')).toBeTruthy();
    expect(checkSelectQuery('.k1 [class^="k2"][class~="j3"] .k4')).toBeFalsy();

    expect(checkSelectQuery('.k5 [class^="k6"] [class^="k7"] .k8')).toBeTruthy();
    expect(checkSelectQuery('.k5 [class^="k6"] [class^="j7"] .k8')).toBeFalsy();

    expect(checkSelectQuery('.k9 [class^="k10"]+[class^="k10"] .k11')).toBeTruthy();
    expect(checkSelectQuery('.k9 [class^="k10"]+[class^="k11"] .k11')).toBeFalsy();

    expect(checkSelectQuery('.k12 [class~="k13"]>[class*="k14"] .k15')).toBeTruthy();
    expect(checkSelectQuery('.k12 [class~="k13"]>[class*="j14"] .k15')).toBeFalsy();

    expect(checkSelectQuery('.k16 [class^="k17"]~[class^="k18"] .k19')).toBeTruthy();
    expect(checkSelectQuery('.k16 [class^="k17"]~[class^="j18"] .k19')).toBeFalsy();

    /** 测试属性选择器 */

    /** 1 */
    expect(checkSelectQuery('.l1 .l2[class~="l3"] .l4')).toBeTruthy();
    expect(checkSelectQuery('.l1 .l6[class~="l3"] .l4')).toBeFalsy();

    expect(checkSelectQuery('.l1 #l3[class*="l3"] .l4')).toBeTruthy();
    expect(checkSelectQuery('.l1 #l6[class*="l3"] .l4')).toBeFalsy();

    expect(checkSelectQuery('.l1 view[class^="l3"] .l4')).toBeTruthy();
    expect(checkSelectQuery('.l1 image[class^="l3"] .l4')).toBeFalsy();

    expect(checkSelectQuery('.l1 [class~=l2].l3 .l4')).toBeTruthy();
    expect(checkSelectQuery('.l1 [class~=l6].l3 .l4')).toBeFalsy();

    expect(checkSelectQuery('.l1 [class*=l2]#l3 .l4')).toBeTruthy();
    expect(checkSelectQuery('.l1 [class*=l6]#l3 .l4')).toBeFalsy();

    expect(checkSelectQuery('.l1 [class$=l2]view .l4')).toBeTruthy();
    expect(checkSelectQuery('.l1 [class$=l6]view .l4')).toBeFalsy();

    /** 2 */
    expect(checkSelectQuery('.m1 .m2 [class~="m3"] .m4')).toBeTruthy();
    expect(checkSelectQuery('.m1 .m6 [class~="m3"] .i4')).toBeFalsy();

    expect(checkSelectQuery('.m1 #m2 [class^="m3"] .m4')).toBeTruthy();
    expect(checkSelectQuery('.m1 #m6 [class^="m3"] .m4')).toBeFalsy();

    expect(checkSelectQuery('.m1 view [class*="m3"] .m4')).toBeTruthy();
    expect(checkSelectQuery('.m1 text [class*="m3"] .m4')).toBeFalsy();

    expect(checkSelectQuery('.m1 [class*="m2"] .m3  .m4')).toBeTruthy();
    expect(checkSelectQuery('.m1 [class*="m2"] .m6  .m4')).toBeFalsy();

    expect(checkSelectQuery('.m1 [class~="m2"] #m3 .m4')).toBeTruthy();
    expect(checkSelectQuery('.m1 [class~="m2"] #m6 .m4')).toBeFalsy();

    expect(checkSelectQuery('.m1 [class$="m2"] view .m4')).toBeTruthy();
    expect(checkSelectQuery('.m1 [class$="m2"] text .m4')).toBeFalsy();

    /** 3 */
    expect(checkSelectQuery('.n1 .n2+[class~="n3"] .n4')).toBeTruthy();
    expect(checkSelectQuery('.n1 .n6+[class^="n3"] .n4')).toBeFalsy();

    expect(checkSelectQuery('.n1 #n2+[class^="n3"] .n4')).toBeTruthy();
    expect(checkSelectQuery('.n1 #n6+[class^="n3"] .n4')).toBeFalsy();

    expect(checkSelectQuery('.n1 view+[class*="n3"] .n4')).toBeTruthy();
    expect(checkSelectQuery('.n1 text+[class*="n3"] .n4')).toBeFalsy();

    expect(checkSelectQuery('.n1 [class*="n2"]+.n3  .n4')).toBeTruthy();
    expect(checkSelectQuery('.n1 [class*="n2"]+.n6  .n4')).toBeFalsy();

    expect(checkSelectQuery('.n1 [class~="n2"]+#n3 .n4')).toBeTruthy();
    expect(checkSelectQuery('.n1 [class~="n2"]+#n6 .n4')).toBeFalsy();

    expect(checkSelectQuery('.n1 [class$="n2"]+view .n4')).toBeTruthy();
    expect(checkSelectQuery('.n1 [class$="n2"]+text .n4')).toBeFalsy();

    /** 4 */
    expect(checkSelectQuery('.o1 .o2>[class~="o3"] .o4')).toBeTruthy();
    expect(checkSelectQuery('.o1 .o6>[class~="o3"] .o4')).toBeFalsy();

    expect(checkSelectQuery('.o1 #o2>[class^="o3"] .o4')).toBeTruthy();
    expect(checkSelectQuery('.o1 #o6>[class^="o3"] .o4')).toBeFalsy();

    expect(checkSelectQuery('.o1 view>[class*="o3"] .o4')).toBeTruthy();
    expect(checkSelectQuery('.o1 text>[class*="o3"] .o4')).toBeFalsy();

    expect(checkSelectQuery('.o1 [class*="o2"]>.o3  .o4')).toBeTruthy();
    expect(checkSelectQuery('.o1 [class*="o2"]>.o6  .o4')).toBeFalsy();

    expect(checkSelectQuery('.o1 [class~="o2"]>#o3 .o4')).toBeTruthy();
    expect(checkSelectQuery('.o1 [class~="o2"]>#o6 .o4')).toBeFalsy();

    expect(checkSelectQuery('.o1 [class$="o2"]>view .o4')).toBeTruthy();
    expect(checkSelectQuery('.o1 [class$="o2"]>text .o4')).toBeFalsy();

    /** 5 */
    expect(checkSelectQuery('.p1 .p2~[class^="p3"] .p4')).toBeTruthy();
    expect(checkSelectQuery('.p1 .p6~[class^="p3"] .p4')).toBeFalsy();

    expect(checkSelectQuery('.p1 #p2~[class~="p3"] .p4')).toBeTruthy();
    expect(checkSelectQuery('.p1 #p6~[class~="p3"] .p4')).toBeFalsy();

    expect(checkSelectQuery('.p1 view~[class*="p3"] .p4')).toBeTruthy();
    expect(checkSelectQuery('.p1 text~[class*="p3"] .p4')).toBeFalsy();

    expect(checkSelectQuery('.p1 [class$="p2"]~.p3  .p4')).toBeTruthy();
    expect(checkSelectQuery('.p1 [class$="p2"]~.p6  .p4')).toBeFalsy();

    expect(checkSelectQuery('.p1 [class~="p2"]~#p3 .p4')).toBeTruthy();
    expect(checkSelectQuery('.p1 [class~="p2"]~#p6 .p4')).toBeFalsy();

    expect(checkSelectQuery('.p1 [class*="p2"]~view .p4')).toBeTruthy();
    expect(checkSelectQuery('.p1 [class*="p2"]~text .p4')).toBeFalsy();

    done();
  });
});
