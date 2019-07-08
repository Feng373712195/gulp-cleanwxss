class CssVariables {
  constructor() {
    this.variables = new Set();
  }

  clear() {
    this.variables.clear();
    return this.variables;
  }

  add(val) {
    if (val.indexOf('==') !== -1 || val.indexOf('===') !== -1) {
      return;
    }
    this.variables.add(val);
    return this.variables;
  }

  show() {
    return [...this.variables];
  }
}

module.exports = new CssVariables();
