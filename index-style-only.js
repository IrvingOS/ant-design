function pascalCase(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/-(\w)/g, (m, n) => n.toUpperCase());
}

// 导出样式，匹配当前目录下所有的 style/index.tsx 文件
// Just import style for https://github.com/ant-design/ant-design/issues/3745
const req = require.context('./components', true, /^\.\/[^_][\w-]+\/style\/index\.tsx?$/);

req.keys().forEach((mod) => {
  let v = req(mod);
  if (v && v.default) {
    v = v.default;
  }
  // 导出组件
  const match = mod.match(/^\.\/([^_][\w-]+)\/index\.tsx?$/);
  if (match && match[1]) {
    if (match[1] === 'message' || match[1] === 'notification') {
      // message & notification should not be capitalized
      exports[match[1]] = v;
    } else {
      // 对组件名进行首字母大写的驼峰处理
      exports[pascalCase(match[1])] = v;
    }
  }
});

// 避免在执行时 module.exports 指向了其他内存地址
// 这里重新将 module.exports 指向 exports 同一处内存地址
module.exports = exports;
