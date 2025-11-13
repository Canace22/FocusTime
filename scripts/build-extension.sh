#!/bin/bash

# 构建浏览器扩展的脚本

echo "Building Focus Timer Extension..."

# 设置环境变量，使用 popup.js 作为入口点
export REACT_APP_ENTRY=popup
export INLINE_RUNTIME_CHUNK=false
export GENERATE_SOURCEMAP=false

# 构建 React 应用
npm run build

# 复制构建文件到 extension 目录
node scripts/copy-extension-files.js
node scripts/build-extension.js

echo "Extension build completed! Files are in the 'extension' directory."

