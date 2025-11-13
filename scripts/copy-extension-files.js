const fs = require('fs');
const path = require('path');

// 复制扩展必需的文件到 extension 目录

const extensionDir = path.join(__dirname, '..', 'extension');
const publicDir = path.join(__dirname, '..', 'public');

// 确保 extension 目录存在
if (!fs.existsSync(extensionDir)) {
  fs.mkdirSync(extensionDir, { recursive: true });
}

// 创建 icons 目录
const iconsDir = path.join(extensionDir, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 复制图标文件（如果存在）
const iconFiles = ['logo192.png', 'logo512.png', 'favicon.ico'];
iconFiles.forEach(icon => {
  const src = path.join(publicDir, icon);
  if (fs.existsSync(src)) {
    if (icon === 'logo192.png') {
      // 复制为不同尺寸的图标
      fs.copyFileSync(src, path.join(iconsDir, 'icon16.png'));
      fs.copyFileSync(src, path.join(iconsDir, 'icon48.png'));
      fs.copyFileSync(src, path.join(iconsDir, 'icon128.png'));
      console.log('✓ Copied icons');
    }
  }
});

// 如果没有图标，创建占位符说明
if (!fs.existsSync(path.join(iconsDir, 'icon16.png'))) {
  console.warn('⚠ Warning: Icon files not found. Please add icons to extension/icons/');
  console.warn('  Required: icon16.png, icon48.png, icon128.png');
}

console.log('Extension files copied!');

