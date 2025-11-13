/* global chrome */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Code, Zap, CheckCircle } from 'lucide-react';

const STORAGE_KEY = 'devFocusTimerData';
const TIMER_STATE_KEY = 'devFocusTimerState';

const getTodayKey = () => new Date().toDateString();

// 使用 Chrome Storage API 替代 localStorage
const loadData = async () => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      if (result[STORAGE_KEY]) {
        const data = result[STORAGE_KEY];
        const todayKey = getTodayKey();
        if (data.date === todayKey) {
          return data;
        }
      }
    } else {
      // 降级到 localStorage（开发环境）
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        const todayKey = getTodayKey();
        if (data.date === todayKey) {
          return data;
        }
      }
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return {
    date: getTodayKey(),
    sessions: 0,
    focusTime: 0,
    deepworkTime: 0,
    distractions: []
  };
};

const saveData = async (data) => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ [STORAGE_KEY]: data });
    } else {
      // 降级到 localStorage（开发环境）
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {
    console.error('Failed to save data:', e);
  }
};

// 加载计时器状态
const loadTimerState = async () => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.local.get(TIMER_STATE_KEY);
      if (result[TIMER_STATE_KEY]) {
        const state = result[TIMER_STATE_KEY];
        // 如果计时器正在运行，计算当前剩余时间
        if (state.isRunning && state.startTime && state.initialTime) {
          const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
          const remaining = Math.max(0, state.initialTime - elapsed);
          return {
            ...state,
            timeLeft: remaining,
            isRunning: remaining > 0
          };
        }
        return state;
      }
    } else {
      // 降级到 localStorage（开发环境）
      const saved = localStorage.getItem(TIMER_STATE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.isRunning && state.startTime && state.initialTime) {
          const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
          const remaining = Math.max(0, state.initialTime - elapsed);
          return {
            ...state,
            timeLeft: remaining,
            isRunning: remaining > 0
          };
        }
        return state;
      }
    }
  } catch (e) {
    console.error('Failed to load timer state:', e);
  }
  return null;
};

// 保存计时器状态
const saveTimerState = async (state) => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ [TIMER_STATE_KEY]: state });
    } else {
      // 降级到 localStorage（开发环境）
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
    }
  } catch (e) {
    console.error('Failed to save timer state:', e);
  }
};

const modes = {
  short: { duration: 15 * 60, label: 'Short Focus', icon: Code, color: 'bg-cyan-500' },
  focus: { duration: 25 * 60, label: 'Focus Block', icon: Code, color: 'bg-blue-500' },
  break: { duration: 5 * 60, label: 'Break', icon: Coffee, color: 'bg-green-500' },
  deepwork: { duration: 60 * 60, label: 'Deep Work', icon: Zap, color: 'bg-purple-500' }
};

export default function PopupApp() {
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [distractions, setDistractions] = useState([]);
  const [focusTime, setFocusTime] = useState(0);
  const [deepworkTime, setDeepworkTime] = useState(0);
  const [hasProgress, setHasProgress] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const initialTimeRef = useRef(null);
  const prevIsRunningRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化加载数据
  useEffect(() => {
    const init = async () => {
      const data = await loadData();
      const { sessions, focusTime, deepworkTime, distractions } = data;
      setSessions(sessions);
      setFocusTime(focusTime);
      setDeepworkTime(deepworkTime);
      setDistractions(distractions || []);

      // 加载计时器状态
      const timerState = await loadTimerState();
      if (timerState) {
        setMode(timerState.mode || 'focus');
        setTimeLeft(timerState.timeLeft || modes.focus.duration);
        setIsRunning(timerState.isRunning || false);
        setCurrentTask(timerState.currentTask || '');
        setHasProgress(timerState.hasProgress || false);
        startTimeRef.current = timerState.startTime || null;
        initialTimeRef.current = timerState.initialTime || null;
      } else {
        setTimeLeft(modes.focus.duration);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  // 保存统计数据
  useEffect(() => {
    if (!isLoading) {
      const data = {
        date: getTodayKey(),
        sessions,
        focusTime,
        deepworkTime,
        distractions
      };
      saveData(data);
    }
  }, [sessions, focusTime, deepworkTime, distractions, isLoading]);

  // 保存计时器状态
  useEffect(() => {
    if (!isLoading) {
      const state = {
        mode,
        timeLeft,
        isRunning,
        currentTask,
        hasProgress,
        startTime: startTimeRef.current,
        initialTime: initialTimeRef.current
      };
      saveTimerState(state);
    }
  }, [mode, timeLeft, isRunning, currentTask, hasProgress, isLoading]);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    if (mode === 'focus' || mode === 'short') {
      const completedTime = initialTimeRef.current || modes[mode].duration;
      setFocusTime(prev => prev + completedTime);
      setSessions(prev => prev + 1);
      setMode('break');
      setTimeLeft(modes.break.duration);
      // 发送通知
      if (typeof chrome !== 'undefined' && chrome.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icons/icon48.png'),
          title: '🎉 专注时段完成！',
          message: `专注时间：${formatTime(completedTime)}\n该休息一下了！`
        });
      }
    } else if (mode === 'deepwork') {
      const completedTime = initialTimeRef.current || modes.deepwork.duration;
      setDeepworkTime(prev => prev + completedTime);
      setSessions(prev => prev + 1);
      setMode('break');
      setTimeLeft(modes.break.duration);
      if (typeof chrome !== 'undefined' && chrome.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icons/icon48.png'),
          title: '🎉 深度工作完成！',
          message: `深度工作时间：${formatTime(completedTime)}\n该休息一下了！`
        });
      }
    } else {
      setMode('focus');
      setTimeLeft(modes.focus.duration);
      if (typeof chrome !== 'undefined' && chrome.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icons/icon48.png'),
          title: '✅ 休息完成！',
          message: '准备开始下一个专注时段！'
        });
      }
    }
    startTimeRef.current = null;
    initialTimeRef.current = null;
    setHasProgress(false);
    playSound();
  }, [mode]);

  // 监听 background 的消息
  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.runtime) return;
    
    const handleMessage = (message) => {
      if (message.type === 'TIMER_UPDATE') {
        setTimeLeft(message.timeLeft);
        setIsRunning(message.isRunning);
      } else if (message.type === 'TIMER_COMPLETE') {
        handleTimerComplete();
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [handleTimerComplete]);

  const finishTimer = useCallback(() => {
    if (initialTimeRef.current === null) return;
    
    setIsRunning(false);
    const completedTime = initialTimeRef.current - timeLeft;
    
    if (completedTime > 0) {
      if (mode === 'focus' || mode === 'short') {
        setFocusTime(prev => prev + completedTime);
        setSessions(prev => prev + 1);
        setMode('break');
        setTimeLeft(modes.break.duration);
        if (typeof chrome !== 'undefined' && chrome.notifications) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icons/icon48.png'),
            title: '🎉 专注时段完成！',
            message: `专注时间：${formatTime(completedTime)}\n该休息一下了！`
          });
        }
      } else if (mode === 'deepwork') {
        setDeepworkTime(prev => prev + completedTime);
        setSessions(prev => prev + 1);
        setMode('break');
        setTimeLeft(modes.break.duration);
        if (typeof chrome !== 'undefined' && chrome.notifications) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icons/icon48.png'),
            title: '🎉 深度工作完成！',
            message: `深度工作时间：${formatTime(completedTime)}\n该休息一下了！`
          });
        }
      } else {
        setMode('focus');
        setTimeLeft(modes.focus.duration);
        if (typeof chrome !== 'undefined' && chrome.notifications) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icons/icon48.png'),
            title: '✅ 休息完成！',
            message: '准备开始下一个专注时段！'
          });
        }
      }
    }
    
    startTimeRef.current = null;
    initialTimeRef.current = null;
    setHasProgress(false);
    playSound();
  }, [mode, timeLeft]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
        if (initialTimeRef.current === null) {
          initialTimeRef.current = timeLeft;
          setHasProgress(true);
        }
        // 通知 background 开始计时
        if (typeof chrome !== 'undefined' && chrome.runtime) {
          chrome.runtime.sendMessage({
            type: 'START_TIMER',
            startTime: startTimeRef.current,
            initialTime: initialTimeRef.current,
            mode
          }).catch(() => {});
        }
      } else if (!prevIsRunningRef.current) {
        const elapsedSeconds = initialTimeRef.current - timeLeft;
        startTimeRef.current = Date.now() - elapsedSeconds * 1000;
        if (typeof chrome !== 'undefined' && chrome.runtime) {
          chrome.runtime.sendMessage({
            type: 'RESUME_TIMER',
            startTime: startTimeRef.current,
            initialTime: initialTimeRef.current,
            mode
          }).catch(() => {});
        }
      }
      prevIsRunningRef.current = true;
      
      const updateTimer = () => {
        if (!startTimeRef.current || initialTimeRef.current === null) return;
        
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const remaining = Math.max(0, initialTimeRef.current - elapsed);
        
        if (remaining <= 0) {
          setTimeLeft(0);
          handleTimerComplete();
        } else {
          setTimeLeft(remaining);
        }
      };
      
      updateTimer();
      intervalRef.current = setInterval(updateTimer, 100);
      
      return () => {
        clearInterval(intervalRef.current);
      };
    } else if (timeLeft === 0) {
      handleTimerComplete();
      prevIsRunningRef.current = false;
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (!isRunning && typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' }).catch(() => {});
      }
      prevIsRunningRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, timeLeft, handleTimerComplete, mode]);

  const playSound = () => {
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gainNode = audio.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audio.destination);
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.3, audio.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.5);
    oscillator.start(audio.currentTime);
    oscillator.stop(audio.currentTime + 0.5);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(modes[mode].duration);
    startTimeRef.current = null;
    initialTimeRef.current = null;
    setHasProgress(false);
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ type: 'RESET_TIMER' }).catch(() => {});
    }
  };

  const switchMode = (newMode) => {
    if (isRunning && initialTimeRef.current !== null) {
      const elapsed = initialTimeRef.current - timeLeft;
      if (elapsed > 0) {
        if (mode === 'focus' || mode === 'short') {
          setFocusTime(prev => prev + elapsed);
        } else if (mode === 'deepwork') {
          setDeepworkTime(prev => prev + elapsed);
        }
      }
    }
    setMode(newMode);
    setTimeLeft(modes[newMode].duration);
    setIsRunning(false);
    startTimeRef.current = null;
    initialTimeRef.current = null;
    setHasProgress(false);
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ type: 'RESET_TIMER' }).catch(() => {});
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const logDistraction = () => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setDistractions(prev => [...prev, { time: timestamp, task: currentTask || 'No task set' }]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">加载中...</div>
        </div>
      </div>
    );
  }

  const progress = ((modes[mode].duration - timeLeft) / modes[mode].duration) * 100;
  const ModeIcon = modes[mode].icon;

  return (
    <div className="min-h-[500px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-full mx-auto">
        {/* Mode Selector */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {Object.entries(modes).map(([key, { label, icon: Icon, color }]) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                mode === key ? color + ' scale-105' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Main Timer */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-4 shadow-2xl">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 mb-3">
              <ModeIcon size={24} className="text-slate-400" />
              <span className="text-lg text-slate-300">{modes[mode].label}</span>
            </div>
            <div className="text-5xl font-bold mb-3 font-mono">{formatTime(timeLeft)}</div>
            <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${modes[mode].color}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-center mb-4 flex-wrap">
            <button
              onClick={toggleTimer}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all text-sm"
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={resetTimer}
              className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all text-sm"
            >
              <RotateCcw size={18} />
              Reset
            </button>
            {hasProgress && timeLeft < modes[mode].duration && (
              <button
                onClick={finishTimer}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all text-sm"
              >
                <CheckCircle size={18} />
                Finish
              </button>
            )}
          </div>

          {/* Task Input */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="What are you working on?"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Distraction Logger */}
          <button
            onClick={logDistraction}
            className="w-full bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded-lg font-medium transition-all text-sm"
          >
            Log Distraction
          </button>
        </div>

        {/* Statistics */}
        <div className="bg-slate-800 rounded-lg p-4 mb-3">
          <h3 className="text-sm font-semibold mb-2">今日统计</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-slate-400">Sessions</div>
              <div className="text-lg font-bold">{sessions}</div>
            </div>
            <div>
              <div className="text-slate-400">Focus Time</div>
              <div className="text-lg font-bold">{formatTime(focusTime)}</div>
            </div>
            <div>
              <div className="text-slate-400">Deep Work</div>
              <div className="text-lg font-bold">{formatTime(deepworkTime)}</div>
            </div>
            <div>
              <div className="text-slate-400">Distractions</div>
              <div className="text-lg font-bold">{distractions.length}</div>
            </div>
          </div>
        </div>

        {/* Distraction Log */}
        {distractions.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">Distraction Log</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {distractions.slice().reverse().slice(0, 5).map((d, i) => (
                <div key={i} className="bg-slate-700 rounded px-3 py-1 flex justify-between text-xs">
                  <span className="text-slate-300 truncate">{d.task}</span>
                  <span className="text-slate-500 ml-2">{d.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

