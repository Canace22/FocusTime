const fs = require('fs');
const path = require('path');

// 构建扩展的脚本
// 这个脚本会在 react-scripts build 之后运行，将构建文件复制到 extension 目录

const extensionDir = path.join(__dirname, '..', 'extension');
const buildDir = path.join(__dirname, '..', 'build');

// 确保 extension 目录存在
if (!fs.existsSync(extensionDir)) {
  fs.mkdirSync(extensionDir, { recursive: true });
}

// 复制构建后的文件
function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

// 复制 popup 相关文件
const popupFiles = [
  { src: 'static/js/main.*.js', dest: 'popup.js' },
  { src: 'static/css/main.*.css', dest: 'popup.css' }
];

// 读取 build 目录
const buildFiles = fs.readdirSync(buildDir, { withFileTypes: true });

// 复制 JS 文件
const jsFiles = buildFiles
  .filter(file => file.isFile() && file.name.startsWith('main.') && file.name.endsWith('.js'))
  .map(file => path.join(buildDir, 'static', 'js', file.name));

if (jsFiles.length > 0) {
  copyFile(jsFiles[0], path.join(extensionDir, 'popup.js'));
  console.log('✓ Copied popup.js');
}

// 复制 CSS 文件
const cssFiles = buildFiles
  .filter(file => file.isFile() && file.name.startsWith('main.') && file.name.endsWith('.css'))
  .map(file => path.join(buildDir, 'static', 'css', file.name));

if (cssFiles.length > 0) {
  copyFile(cssFiles[0], path.join(extensionDir, 'popup.css'));
  console.log('✓ Copied popup.css');
}

// 复制静态资源（如果有）
const staticDir = path.join(buildDir, 'static');
if (fs.existsSync(staticDir)) {
  const mediaDir = path.join(staticDir, 'media');
  if (fs.existsSync(mediaDir)) {
    const extensionMediaDir = path.join(extensionDir, 'static', 'media');
    if (!fs.existsSync(extensionMediaDir)) {
      fs.mkdirSync(extensionMediaDir, { recursive: true });
    }
    // 复制媒体文件
    const mediaFiles = fs.readdirSync(mediaDir);
    mediaFiles.forEach(file => {
      copyFile(
        path.join(mediaDir, file),
        path.join(extensionMediaDir, file)
      );
    });
    console.log('✓ Copied static media files');
  }
}

console.log('Extension build completed!');

