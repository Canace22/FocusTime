const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 简化的扩展构建脚本
// 这个脚本会：
// 1. 临时修改 index.js 为 popup.js
// 2. 运行构建
// 3. 复制文件到 extension 目录
// 4. 恢复 index.js

const srcDir = path.join(__dirname, '..', 'src');
const extensionDir = path.join(__dirname, '..', 'extension');
const buildDir = path.join(__dirname, '..', 'build');

console.log('Building extension...');

// 备份原始 index.js
const indexJsPath = path.join(srcDir, 'index.js');
const indexJsBackup = path.join(srcDir, 'index.js.backup');
const popupJsPath = path.join(srcDir, 'popup.js');

if (!fs.existsSync(popupJsPath)) {
  console.error('Error: popup.js not found in src directory');
  process.exit(1);
}

// 备份 index.js
if (fs.existsSync(indexJsPath)) {
  fs.copyFileSync(indexJsPath, indexJsBackup);
}

// 临时替换 index.js 为 popup.js 的内容
const popupContent = fs.readFileSync(popupJsPath, 'utf8');
fs.writeFileSync(indexJsPath, popupContent);

try {
  // 运行构建
  console.log('Running React build...');
  execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

  // 复制文件
  console.log('Copying files to extension directory...');
  
  // 确保 extension 目录存在
  if (!fs.existsSync(extensionDir)) {
    fs.mkdirSync(extensionDir, { recursive: true });
  }

  // 复制 popup.html（如果不存在）
  const popupHtmlPath = path.join(extensionDir, 'popup.html');
  if (!fs.existsSync(popupHtmlPath)) {
    const popupHtmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Focus Timer</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div id="root"></div>
  <script src="popup.js"></script>
</body>
</html>`;
    fs.writeFileSync(popupHtmlPath, popupHtmlContent);
  }

  // 复制构建后的 JS 和 CSS
  const staticJsDir = path.join(buildDir, 'static', 'js');
  const staticCssDir = path.join(buildDir, 'static', 'css');

  if (fs.existsSync(staticJsDir)) {
    const jsFiles = fs.readdirSync(staticJsDir).filter(f => f.endsWith('.js'));
    if (jsFiles.length > 0) {
      const mainJs = jsFiles.find(f => f.startsWith('main.')) || jsFiles[0];
      fs.copyFileSync(
        path.join(staticJsDir, mainJs),
        path.join(extensionDir, 'popup.js')
      );
      console.log('✓ Copied popup.js');
    }
  }

  if (fs.existsSync(staticCssDir)) {
    const cssFiles = fs.readdirSync(staticCssDir).filter(f => f.endsWith('.css'));
    if (cssFiles.length > 0) {
      const mainCss = cssFiles.find(f => f.startsWith('main.')) || cssFiles[0];
      fs.copyFileSync(
        path.join(staticCssDir, mainCss),
        path.join(extensionDir, 'popup.css')
      );
      console.log('✓ Copied popup.css');
    }
  }

  // 复制图标
  const iconsDir = path.join(extensionDir, 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const publicDir = path.join(__dirname, '..', 'public');
  const logo192 = path.join(publicDir, 'logo192.png');
  if (fs.existsSync(logo192)) {
    fs.copyFileSync(logo192, path.join(iconsDir, 'icon16.png'));
    fs.copyFileSync(logo192, path.join(iconsDir, 'icon48.png'));
    fs.copyFileSync(logo192, path.join(iconsDir, 'icon128.png'));
    console.log('✓ Copied icons');
  } else {
    console.warn('⚠ Warning: logo192.png not found, icons not copied');
  }

  // 复制 manifest.json（如果不存在）
  const manifestPath = path.join(extensionDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.warn('⚠ Warning: manifest.json not found in extension directory');
  }

  // 复制 background.js（如果不存在）
  const backgroundPath = path.join(extensionDir, 'background.js');
  if (!fs.existsSync(backgroundPath)) {
    const srcBackground = path.join(__dirname, '..', 'extension', 'background.js');
    if (fs.existsSync(srcBackground)) {
      fs.copyFileSync(srcBackground, backgroundPath);
      console.log('✓ Copied background.js');
    }
  }

  console.log('\n✅ Extension build completed!');
  console.log(`   Files are in: ${extensionDir}`);

} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} finally {
  // 恢复 index.js
  if (fs.existsSync(indexJsBackup)) {
    fs.copyFileSync(indexJsBackup, indexJsPath);
    fs.unlinkSync(indexJsBackup);
    console.log('✓ Restored index.js');
  }
}

