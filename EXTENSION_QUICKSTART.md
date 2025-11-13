# 浏览器插件快速开始指南 🚀

## 快速安装（3 步）

### 1. 构建扩展
```bash
npm install
npm run build:extension
```

### 2. 加载到 Chrome
1. 打开 Chrome，访问 `chrome://extensions/`
2. 开启右上角"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目的 `extension` 目录

### 3. 开始使用
点击浏览器工具栏的扩展图标，开始专注！

## 功能说明

### 核心功能
- ✅ **后台计时** - 关闭 popup 后仍在后台运行
- ✅ **Badge 显示** - 图标上显示剩余分钟数
- ✅ **桌面通知** - 计时完成自动提醒
- ✅ **数据持久化** - 数据保存在浏览器本地

### 工作模式
- **Short Focus** (15分钟) - 快速专注
- **Focus Block** (25分钟) - 经典番茄钟
- **Deep Work** (60分钟) - 深度工作
- **Break** (5分钟) - 休息时间

## 常见问题

**Q: 图标不显示？**  
A: 确保 `extension/icons/` 目录包含图标文件，或运行构建脚本自动复制。

**Q: 通知不显示？**  
A: 检查浏览器通知权限，在 Chrome 设置中允许扩展发送通知。

**Q: 如何更新扩展？**  
A: 重新运行 `npm run build:extension`，然后在扩展页面点击刷新按钮。

## 详细文档

查看 [EXTENSION_README.md](./EXTENSION_README.md) 获取完整文档。

