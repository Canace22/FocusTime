// Background Service Worker for Focus Timer Extension

const TIMER_STATE_KEY = 'devFocusTimerState';
let timerInterval = null;
let currentTimerState = null;

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_TIMER') {
    startBackgroundTimer(message.startTime, message.initialTime, message.mode);
  } else if (message.type === 'PAUSE_TIMER') {
    pauseBackgroundTimer();
  } else if (message.type === 'RESUME_TIMER') {
    startBackgroundTimer(message.startTime, message.initialTime, message.mode);
  } else if (message.type === 'RESET_TIMER') {
    resetBackgroundTimer();
  }
  return true;
});

// 启动后台计时器
function startBackgroundTimer(startTime, initialTime, mode) {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  currentTimerState = {
    startTime,
    initialTime,
    mode,
    isRunning: true
  };

  // 每秒更新一次
  timerInterval = setInterval(() => {
    if (!currentTimerState) return;

    const elapsed = Math.floor((Date.now() - currentTimerState.startTime) / 1000);
    const remaining = Math.max(0, currentTimerState.initialTime - elapsed);

    // 更新 badge
    updateBadge(remaining, currentTimerState.mode);

    // 通知 popup（如果打开）
    chrome.runtime.sendMessage({
      type: 'TIMER_UPDATE',
      timeLeft: remaining,
      isRunning: true
    }).catch(() => {
      // popup 可能未打开，忽略错误
    });

    // 检查是否完成
    if (remaining <= 0) {
      handleTimerComplete(currentTimerState.mode, currentTimerState.initialTime);
      resetBackgroundTimer();
    }
  }, 1000);
}

// 暂停后台计时器
function pauseBackgroundTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  if (currentTimerState) {
    currentTimerState.isRunning = false;
  }
  updateBadge(null, null);
}

// 重置后台计时器
function resetBackgroundTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  currentTimerState = null;
  updateBadge(null, null);
}

// 更新扩展图标 badge
function updateBadge(timeLeft, mode) {
  if (timeLeft === null || timeLeft === undefined) {
    chrome.action.setBadgeText({ text: '' });
    return;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // 显示分钟数，如果小于1分钟则显示秒数
  if (minutes > 0) {
    chrome.action.setBadgeText({ text: minutes.toString() });
  } else {
    chrome.action.setBadgeText({ text: seconds.toString() });
  }

  // 根据模式设置 badge 颜色
  const colors = {
    short: '#06b6d4', // cyan
    focus: '#3b82f6', // blue
    break: '#10b981', // green
    deepwork: '#a855f7' // purple
  };
  chrome.action.setBadgeBackgroundColor({ 
    color: colors[mode] || '#3b82f6' 
  });
}

// 处理计时器完成
async function handleTimerComplete(mode, initialTime) {
  // 发送通知
  const modeLabels = {
    short: 'Short Focus',
    focus: 'Focus Block',
    break: 'Break',
    deepwork: 'Deep Work'
  };

  let title, message;
  if (mode === 'focus' || mode === 'short') {
    title = '🎉 专注时段完成！';
    message = `专注时间：${formatTime(initialTime)}\n该休息一下了！`;
  } else if (mode === 'deepwork') {
    title = '🎉 深度工作完成！';
    message = `深度工作时间：${formatTime(initialTime)}\n该休息一下了！`;
  } else {
    title = '✅ 休息完成！';
    message = '准备开始下一个专注时段！';
  }

  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon48.png'),
    title: title,
    message: message
  });

  // 通知 popup
  chrome.runtime.sendMessage({
    type: 'TIMER_COMPLETE',
    mode,
    initialTime
  }).catch(() => {
    // popup 可能未打开，忽略错误
  });
}

// 格式化时间
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 扩展安装时的初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('Focus Timer Extension installed');
});

// 监听存储变化，同步计时器状态
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes[TIMER_STATE_KEY]) {
    const newState = changes[TIMER_STATE_KEY].newValue;
    if (newState && newState.isRunning && newState.startTime && newState.initialTime) {
      // 如果状态显示正在运行，但后台计时器未运行，则启动它
      if (!timerInterval) {
        startBackgroundTimer(newState.startTime, newState.initialTime, newState.mode);
      }
    } else if (!newState || !newState.isRunning) {
      // 如果状态显示未运行，停止后台计时器
      if (timerInterval) {
        pauseBackgroundTimer();
      }
    }
  }
});

