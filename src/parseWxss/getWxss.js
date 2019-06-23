const path = require('path');
const fsp = require('fs-promise');

const findWxss = (importSrc, wxRootPath, pagePath) => new Promise((resolve, reject) => {
  let wxssPath = path.join(pagePath, importSrc);
  fsp.readFile(wxssPath, 'utf-8')
    .catch(() => {
      wxssPath = path.join(wxRootPath, importSrc);
      return fsp.readFile(wxssPath, 'utf-8');
    })
    .then((res) => {
      resolve(res);
    })
    .catch((err) => {
      console.log(err, 'err');
      console.log('没有找到wxss文件 wxss文件地址:', importSrc);
      reject(err);
    });
});

// 这个方法用来过滤掉Wxss中的注释
// 和引入@import
const getWxss = (str, wxRootPath, pagePath) => {
  const improts = [];
  // 过滤掉wxss中的注释
  const wxssStr = str.replace(/\/\*([\s\S]*?)\*\//g, '')
  // 过滤掉keyframes
    .replace(/\s?@keyframes.*\{([\s\S]*?)\n\}/g, '')
  // 过滤掉font-face
    .replace(/\s?@font-face.*\{([\s\S]*?)\n\}/g, '')
  // 过滤掉media
    .replace(/\s?@media.*\{([\s\S]*?)\n\}/g, '')
  // 过滤掉supports
    .replace(/\s?@supports.*\{([\s\S]*?)\n\}/g, '');

  // 获取wxss中的import
  wxssStr.replace(/@import\s?['|"](.*)['|"];/g, ($1, $2) => {
    // 如果没有后缀 wxss则添加上
    improts.push(/\.wxss$/.test($2) ? $2 : `${$2}.wxss`);
  });

  if (improts.length === 0) return wxssStr;

  return Promise.all(improts.map(src => findWxss(src, wxRootPath, pagePath)))
    .then((res) => {
      let resWxss = wxssStr;
      res.forEach(async (wxss) => {
        const importWxssStr = await getWxss(wxss);
        resWxss = `${importWxssStr} \n ${resWxss}`;
      });
      return resWxss;
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = getWxss;
