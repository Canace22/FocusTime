# Focus Timer for Devs 🎯

A focus timer designed specifically for frontend developers to beat distractions and ship features efficiently.

## ✨ Key Features

### 🕐 Three Work Modes
- **Focus Block (25 min)**: Classic Pomodoro technique, perfect for daily development tasks
- **Short Focus (15 min)**: Quick focus mode for handling small tasks
- **Deep Work (90 min)**: Extended deep work sessions for complex feature development
- **Break (5 min)**: Rest time to let your brain recover

### 📊 Distraction Tracker
- Click the "Log Distraction" button when you catch yourself getting distracted
- View distraction logs to understand your distraction patterns
- Build awareness and gradually improve focus

### 📝 Task Tracking
- Record what you're currently working on
- Distraction logs are linked to your current task
- Maintain continuity in your work state

### 📈 Statistics Dashboard
- **Sessions**: Number of completed focus sessions today
- **Total Focus**: Total focus time (Focus + Deep Work)
- **Deep Work**: Deep work session time
- **Distractions**: Number of distractions logged

### 💾 Data Persistence
- Automatically saves data using localStorage
- Data automatically restores after page refresh
- Daily automatic reset of statistics

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
```

The build files will be generated in the `build` directory.

## 🚀 Deployment

### GitHub Pages

The project includes GitHub Actions workflows for automatic deployment:

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Select source: "GitHub Actions"

2. **Automatic Deployment**:
   - The `deploy.yml` workflow automatically deploys to GitHub Pages on every push to `main` branch
   - Your app will be available at: `https://canace22.github.io/FocusTime`

3. **Manual Deployment**:
   - You can also trigger deployment manually from the Actions tab

### Other Platforms

You can deploy the `build` folder to any static hosting service:
- **Vercel**: `vercel --prod`
- **Netlify**: Drag and drop the `build` folder
- **Cloudflare Pages**: Connect your GitHub repository

## 🛠️ Tech Stack

- **React 19.2** - UI Framework
- **Tailwind CSS 3.4** - Styling Framework
- **Lucide React** - Icon Library
- **Create React App** - Project Scaffold

## 📖 Usage Guide

### Basic Workflow

1. **Select Mode**: Click the mode buttons at the top (Focus Block, Short Focus, Deep Work, or Break)
2. **Set Task**: Enter what you're working on in the input field
3. **Start Timer**: Click the "Start" button to begin focusing
4. **Log Distractions**: If you get distracted, click the "Log Distraction" button
5. **View Stats**: Check your focus data for today at the bottom

### Pro Tips

- 🔕 Close Slack/Discord during focus blocks
- 🎯 Use Deep Work mode for complex features
- 📝 Log distractions to build awareness
- ☕ Actually take breaks - your brain needs them

## 📁 Project Structure

```
focus-timer/
├── public/          # Static assets
├── src/
│   ├── App.js      # Main application component
│   ├── index.js    # Entry point
│   └── index.css   # Global styles (includes Tailwind)
├── tailwind.config.js    # Tailwind configuration
├── postcss.config.js     # PostCSS configuration
└── package.json
```

## 🔧 Configuration

### Tailwind CSS

The project uses Tailwind CSS v3 for styling. Configuration file is located at `tailwind.config.js`.

### Data Storage

All data is stored in the browser's localStorage with the key `devFocusTimerData`. Data format:

```javascript
{
  date: "Mon Jan 01 2024",  // Date string
  sessions: 5,              // Number of sessions
  focusTime: 3600,          // Focus time in seconds
  deepworkTime: 5400,       // Deep work time in seconds
  distractions: [...]       // Array of distraction records
}
```

## 🧪 Testing

```bash
npm test
```

## 🔄 CI/CD

The project includes GitHub Actions workflows:

- **CI Workflow** (`.github/workflows/ci.yml`):
  - Runs tests on Node.js 18.x and 20.x
  - Builds the project
  - Uploads build artifacts

- **Deploy Workflow** (`.github/workflows/deploy.yml`):
  - Automatically deploys to GitHub Pages on push to `main`
  - Can be triggered manually via workflow_dispatch

## 📝 Development Notes

### Code Characteristics

- ✅ Functional programming approach, minimal side effects
- ✅ Modular design, easy to maintain
- ✅ Clean and readable code structure
- ✅ React Hooks for state management
- ✅ Automatic data persistence

### Key Feature Implementation

- **Timer**: Implemented using `setInterval` and React Hooks
- **Data Persistence**: Automatic saving using `localStorage` and `useEffect`
- **Time Statistics**: Accurately records actual completed focus time
- **Mode Switching**: Supports switching modes during timer and saves progress

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

MIT License

---

**Stay focused, ship faster!** 🚀
