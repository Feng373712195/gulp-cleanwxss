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
        "no-cond-assign":"off" 
    }
};