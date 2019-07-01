module.exports = {
    "extends": "airbnb",
    "parser": "babel-eslint",
    "env": {
        "browser": true,
        "commonjs": true,
    },
    "parserOptions": { 
        "sourceType": "module" 
    },
    "rules":{
        "linebreak-style": [0 ,"error", "windows"], 
        "no-cond-assign":"off",
        "max-len":[0,"error",{"code":"150"}],
        "no-use-before-define": ["error", { "functions": false, "classes": true }],
        "no-underscore-dangle":"off",
        "no-plusplus":"off",
        "no-console":"off",
        "no-continue":"off",
        "no-param-reassign":"off",
        "consistent-return":"off",
        "no-bitwise":"off"
    }
};
