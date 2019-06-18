
const findWxss = importSrc => new Promise((resolve, reject) => {
  const wxssPath = path.join(path.join(PAGES_PATH, PAGE_DIR_PATH), importSrc);
  fsp.readFile(wxssPath, 'utf-8')
    .catch((err) => {
      const wxssPath = path.join(WX_DIR_PATH, importSrc);
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
export const getWxss = (str) => {
  const improts = [];

  // 过滤掉wxss中的注释
  str = str.replace(/\/\*([\s\S]*?)\*\//g, '');
  // 过滤掉keyframes
  str = str.replace(/\s?@keyframes.*\{([\s\S]*?)\n\}/g, '');
  // 过滤掉font-face
  str = str.replace(/\s?@font-face.*\{([\s\S]*?)\n\}/g, '');

  // 获取wxss中的import
  // 2019-05-04
  // 如果文件中还有improt呢 需要处理这种情况
  str.replace(/@import\s?[\'|\"](.*)[\'|\"]\;/g, ($1, $2) => {
    // 如果没有后缀 wxss则添加上
    improts.push(/\.wxss$/.test($2) ? $2 : `${$2}.wxss`);
  });

  if (improts.length == 0) return str;

  return Promise.all(improts.map(src => findWxss(src)))
    .then((res) => {
      let resWxss = str;
      res.forEach(async (wxss) => {
        wxss = await getWxss(wxss);
        resWxss = `${wxss} \n ${await resWxss}`;
      });
      return resWxss;
    })
    .catch((err) => {
      console.log(err);
    });
};
