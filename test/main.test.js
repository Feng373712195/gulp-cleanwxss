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
  });
  stream.write(wxssFile1);
  stream.once('data', (file) => {
    console.log(String(file.contents), 'file');

    // 获取清除完class的wxss
    const cleanedFile = String(file.contents);
    // 获取Wxss中的选择器
    const classSelects = [];
    // 获取clss id 标签选择器
    cleanedFile.replace(/([.|#|\w+].*)\{/g, ($1, $2) => {
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

    done();
  });
});
