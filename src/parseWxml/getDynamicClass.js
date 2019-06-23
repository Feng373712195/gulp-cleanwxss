// 是否字符串正则表达式
const isStringReg = /['|"](.*?)['|"]/;

function getJoinClass(str, cssVariable, res = []) {
  const getSumValueReg = /\s?(["|']?[a-zA-Z0-9_\- ]+\s?['|"]?)\s?\+{1}\s?(["|']?[a-zA-Z0-9_\- ]+\s?['|"]?)\s?/;
  let sumVal = '';

  while (sumVal = getSumValueReg.exec(str)) {
    let sumL = [];
    let sumR = [];
    const sumClass = [];

    let [sumExpression, sumLVal, sumRVal] = sumVal;
    sumLVal = sumLVal.trimLeft().trimRight();
    sumRVal = sumRVal.trimLeft().trimRight();
    str = str.replace(sumExpression, 'customCssVariable');

    if (isStringReg.test(sumLVal)) {
      const classes = sumLVal.replace(isStringReg, '$1').split(' ');
      const lastClass = classes.pop();
      if (classes.length) { res = res.concat(classes); }
      sumL.push(lastClass);
    } else if (cssVariable[sumLVal]) {
    //   _cssVariable.add(sumLVal);
      sumL = sumL.concat(cssVariable[sumLVal]);
    }

    if (isStringReg.test(sumRVal)) {
      const classes = sumRVal.replace(isStringReg, '$1').split(' ');
      const lastClass = classes.pop();
      if (classes.length) { res = res.concat(classes); }
      sumR.push(lastClass);
    } else if (cssVariable[sumRVal]) {
    //   _cssVariable.add(sumRVal);
      sumR = sumR.concat(cssVariable[sumRVal]);
    }

    sumL.forEach((L) => {
      sumR.forEach((R) => { sumClass.push(`${L}${R}`); });
    });

    cssVariable.customCssVariable = sumClass;

    if (~str.indexOf('+')) {
      // 自定义的 css变量
      return getJoinClass(str, cssVariable, res);
    }
    if (cssVariable.customCssVariable) {
      res = res.concat(cssVariable.customCssVariable);
    }
    delete cssVariable.customCssVariable;
    return res;
  }
}

function getDynamicClass(str, cssVariable) {
  const res = [];
  const classes = str.split(/\|\||&&/g);

  classes.forEach((classStr) => {
    if (classStr !== '') {
      if (isStringReg.test(classStr)) {
        let _classes = getJoinClass(classStr, cssVariable);
        // 解决字符串class 导致存入‘/‘classname/’’这样的class名
        if (_classes) {
          _classes = _classes.map(item => item.replace(isStringReg, '$1'));
        } else {
          _classes = ~classStr.indexOf(' ') ? classStr.replace(isStringReg, '$1').split(' ') : [classStr.replace(isStringReg, '$1')];
        }
        return res.push(..._classes.filter(v => v));
      } if (cssVariable[classStr]) {
        return res.push(...cssVariable[classStr]);
      }
    }
  });

  return res;
}

module.exports = getDynamicClass;
