
// 检查后代选择器是否生效
function checkSelectQuery(classSelect, findNodes = null, type) {
  // console.log( classSelect,'classSelect' )
  let selectNodes = null;

  // 过滤掉伪元素伪类
  const selectQuery = classSelect.replace(pseudoClassReg, '');
  // 从子节点开始查找 把选择器数组翻转

  selectNodes = selectQuery
    .replace(/\s?([\>\+\~])\s?/g, '$1')
    .split(/\s/g)
    .filter(v => v)
    .reduce((prev, curt) => {
      curt = hasSelectorReg.test(curt)
        ? curt.match(/(\.|\#)?\w+(\~|\+|\>)?/g)
          .map(select => select.replace(/(.*)(\~|\+|\>)/, '$2$1'))
        : [curt];
      prev.push(...curt);
      return prev;
    }, [])
    .reverse();

  // 选择器只匹配一个元素
  if (selectNodes.length == 1) {
    return !!_checkHasSelect(selectNodes[0]);
  }
  // 多元素选择器

  // 存放已查找到的元素
  let finds = findNodes ? findNodes.nodes : [];
  // 把选择器转化成数组 如 .search-block .search-list .tag 转为 [.tag,.search-list,.search-block]
  for (let i2 = 0, len = selectNodes.length; i2 < len; i2++) {
    if (hasSelectorReg.test(selectNodes[i2])) {
      const selectQueryHandles = {
        '>': checkChildSelectQuery,
        '+': checkAdjacentSelectQuery,
        '~': checkProgenySelectQuery,
      };
      const selectQueryType = selectNodes[i2][0];
      const classSelect = selectNodes[i2].slice(1);
      const selectQueryParam = [classSelect,
        {
          select: i2 != 0 ? hasSelectorReg.test(selectNodes[i2 - 1]) ? selectNodes[i2 - 1].slice(1) : selectNodes[i2 - 1] : '',
          nodes: finds,
        },
      ];
      // console.log( selectQueryParam,'selectQueryParam' )
      const checkSelectQueryRes = selectQueryHandles[selectQueryType](...selectQueryParam);
      if (i2 == selectNodes.length - 1) {
        return checkSelectQueryRes.some(v => v);
      }
      if (checkSelectQueryRes) {
        finds = checkSelectQueryRes;
        continue;
      } else return false;
    }

    // 2019-5-2 重写这段逻辑
    if (i2 == 0) {
      let matchNode = null;
      if (matchNode = _checkHasSelect(selectNodes[i2])) {
        finds = matchNode;
      } else {
        return false;
      }
    } else {
      const newFinds = [];
      finds.forEach((node) => {
        newFinds.push(_findNodeParent(node, selectNodes[i2]));
      });

      finds = newFinds.filter(v => v);
      if (finds.length == 0) {
        return false;
      }
    }

    if (i2 == selectNodes.length - 1) {
      return finds.some(v => v);
    }
    continue;
  }
}

module.exports = checkSelectQuery;
