const fs = require('fs');
const path = require('path');
process.env.EPUBJS = fs.readFileSync(path.resolve(__dirname, "node_modules/epubjs/dist/epub.min.js"), "utf8");
process.env.REACT_APP_EPUB = "HELLO"; 

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'transform-inline-environment-variables'
  ],
};
