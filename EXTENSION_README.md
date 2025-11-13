# Focus Timer 浏览器插件 🎯

基于 Focus Timer 项目的浏览器插件版本，让你在浏览器中随时使用专注计时器。

## ✨ 功能特性

### 🕐 三种工作模式
- **Short Focus (15分钟)**: 快速专注模式，适合处理小任务
- **Focus Block (25分钟)**: 经典的番茄工作法，适合日常开发任务
- **Deep Work (60分钟)**: 深度工作模式，适合复杂功能开发
- **Break (5分钟)**: 休息时间，让大脑恢复

### 📊 核心功能
- ✅ **后台计时**: 即使关闭 popup，计时器仍在后台运行
- ✅ **Badge 显示**: 扩展图标上显示剩余时间
- ✅ **桌面通知**: 计时完成时发送通知提醒
- ✅ **数据持久化**: 使用 Chrome Storage API 保存数据
- ✅ **分心记录**: 记录分心时刻，帮助建立专注意识
- ✅ **任务跟踪**: 记录当前工作内容
- ✅ **统计数据**: 查看今日的专注数据

## 🚀 安装步骤

### 方法一：从源码构建（推荐）

1. **克隆或下载项目**
   ```bash
   cd focus-timer
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **构建扩展**
   ```bash
   npm run build:extension
   ```

4. **加载扩展到 Chrome**
   - 打开 Chrome 浏览器
   - 访问 `chrome://extensions/`
   - 开启右上角的"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目的 `extension` 目录

### 方法二：直接使用 extension 目录

如果 `extension` 目录已经包含构建好的文件，可以直接加载：

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `extension` 目录

## 📖 使用指南

### 基本操作

1. **点击扩展图标**：打开 popup 界面
2. **选择模式**：点击顶部的模式按钮（Short Focus、Focus Block、Deep Work、Break）
3. **设置任务**：在输入框中输入当前工作内容
4. **开始计时**：点击 "Start" 按钮开始专注
5. **暂停/继续**：点击 "Pause" 暂停，再次点击继续
6. **提前完成**：点击 "Finish" 提前结束当前时段
7. **记录分心**：如果分心了，点击 "Log Distraction" 记录

### 高级功能

- **后台运行**：关闭 popup 后，计时器仍在后台运行
- **Badge 显示**：扩展图标上会显示剩余分钟数
- **自动通知**：计时完成时会收到桌面通知
- **数据同步**：所有数据保存在浏览器本地，关闭浏览器后仍会保留

## 🛠️ 技术实现

### 架构设计

```
┌─────────────────┐
│   Popup UI      │  ← React 组件，用户交互界面
│   (PopupApp.js) │
└────────┬────────┘
         │ 消息通信
         ↓
┌─────────────────┐
│ Background SW   │  ← Service Worker，后台计时
│ (background.js) │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Chrome Storage  │  ← 数据持久化
└─────────────────┘
```

### 核心组件

1. **PopupApp.js**: Popup 界面的 React 组件
   - 使用 Chrome Storage API 替代 localStorage
   - 与 background service worker 通信
   - 适配小尺寸 popup 界面

2. **background.js**: Background Service Worker
   - 后台运行计时器
   - 更新扩展图标 badge
   - 发送桌面通知
   - 监听存储变化

3. **manifest.json**: 扩展配置文件
   - Manifest V3 格式
   - 配置权限（storage, alarms, notifications）
   - 定义 popup 和 background

### 数据存储

使用 Chrome Storage API 存储两类数据：

1. **统计数据** (`devFocusTimerData`):
   ```javascript
   {
     date: "Mon Jan 01 2024",
     sessions: 5,
     focusTime: 3600,
     deepworkTime: 5400,
     distractions: [...]
   }
   ```

2. **计时器状态** (`devFocusTimerState`):
   ```javascript
   {
     mode: "focus",
     timeLeft: 1200,
     isRunning: true,
     currentTask: "Fix bug",
     startTime: 1234567890,
     initialTime: 1500
   }
   ```

## 🔧 开发说明

### 项目结构

```
focus-timer/
├── extension/              # 扩展文件目录
│   ├── manifest.json      # 扩展配置
│   ├── popup.html         # Popup HTML
│   ├── popup.js           # Popup JS (构建后)
│   ├── popup.css          # Popup CSS (构建后)
│   ├── background.js      # Background Service Worker
│   └── icons/             # 扩展图标
├── src/
│   ├── PopupApp.js        # Popup React 组件
│   ├── popup.js           # Popup 入口文件
│   └── ...
├── scripts/
│   └── build-extension-simple.js  # 构建脚本
└── package.json
```

### 构建流程

1. 构建脚本临时替换 `src/index.js` 为 `src/popup.js`
2. 运行 `react-scripts build` 构建 React 应用
3. 复制构建后的文件到 `extension` 目录
4. 恢复原始的 `src/index.js`

### 修改代码

- **修改 Popup 界面**: 编辑 `src/PopupApp.js`
- **修改后台逻辑**: 编辑 `extension/background.js`
- **修改配置**: 编辑 `extension/manifest.json`

修改后需要重新构建：
```bash
npm run build:extension
```

然后在 Chrome 扩展页面点击刷新按钮。

## 🐛 故障排除

### 扩展无法加载

1. 检查 `extension` 目录是否包含所有必需文件
2. 检查 `manifest.json` 格式是否正确
3. 查看 Chrome 扩展页面的错误信息

### 计时器不工作

1. 检查浏览器控制台是否有错误
2. 检查 background service worker 是否正常运行
3. 检查权限是否已授予（storage, notifications）

### 图标不显示

1. 确保 `extension/icons/` 目录存在
2. 确保包含 `icon16.png`, `icon48.png`, `icon128.png`
3. 可以临时使用 `public/logo192.png` 作为图标

### 通知不显示

1. 检查浏览器通知权限是否已授予
2. 在 Chrome 设置中允许扩展发送通知

## 📝 注意事项

1. **数据存储**: 数据存储在浏览器本地，清除浏览器数据会丢失
2. **跨设备同步**: 当前版本不支持跨设备同步（可后续添加 Chrome Sync）
3. **浏览器兼容**: 目前仅支持 Chrome/Edge（Manifest V3）
4. **图标资源**: 需要手动添加图标文件到 `extension/icons/` 目录

## 🔄 更新日志

### v1.0.0
- ✅ 初始版本
- ✅ 支持四种工作模式
- ✅ 后台计时功能
- ✅ Badge 显示
- ✅ 桌面通知
- ✅ 数据持久化
- ✅ 分心记录
- ✅ 统计数据

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**Stay focused, ship faster!** 🚀

