import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Code, Zap } from 'lucide-react';

// localStorage key
const STORAGE_KEY = 'devFocusTimerData';

// 获取今天的日期字符串
const getTodayKey = () => new Date().toDateString();

// 从localStorage加载数据
const loadData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      const todayKey = getTodayKey();
      // 如果是今天的数据，返回；否则返回空数据
      if (data.date === todayKey) {
        return data;
      }
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return {
    date: getTodayKey(),
    sessions: 0,
    focusTime: 0, // 总专注时间（秒）
    deepworkTime: 0, // 深度工作时间（秒）
    distractions: []
  };
};

// 保存数据到localStorage
const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
};

// 模式配置（移到组件外部，避免每次渲染重新创建）
const modes = {
  short: { duration: 15 * 60, label: 'Short Focus', icon: Code, color: 'bg-cyan-500' },
  focus: { duration: 25 * 60, label: 'Focus Block', icon: Code, color: 'bg-blue-500' },
  break: { duration: 5 * 60, label: 'Break', icon: Coffee, color: 'bg-green-500' },
  deepwork: { duration: 90 * 60, label: 'Deep Work', icon: Zap, color: 'bg-purple-500' }
};

export default function DevFocusTimer() {
  const [mode, setMode] = useState('focus'); // focus, break, deepwork
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [distractions, setDistractions] = useState([]);
  const [focusTime, setFocusTime] = useState(0); // 总专注时间（秒）
  const [deepworkTime, setDeepworkTime] = useState(0); // 深度工作时间（秒）
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null); // 记录开始时间
  const initialTimeRef = useRef(null); // 记录初始时间

  // 初始化时加载数据
  useEffect(() => {
    const data = loadData();
    setSessions(data.sessions);
    setFocusTime(data.focusTime);
    setDeepworkTime(data.deepworkTime);
    setDistractions(data.distractions || []);
  }, []);

  // 保存数据到localStorage
  useEffect(() => {
    const data = {
      date: getTodayKey(),
      sessions,
      focusTime,
      deepworkTime,
      distractions
    };
    saveData(data);
  }, [sessions, focusTime, deepworkTime, distractions]);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    if (mode === 'focus' || mode === 'short') {
      // 记录完成的focus时间（使用初始时间，因为已经完成）
      const completedTime = initialTimeRef.current || modes[mode].duration;
      setFocusTime(prev => prev + completedTime);
      setSessions(prev => prev + 1);
      setMode('break');
      setTimeLeft(modes.break.duration);
    } else if (mode === 'deepwork') {
      // 记录完成的deepwork时间
      const completedTime = initialTimeRef.current || modes.deepwork.duration;
      setDeepworkTime(prev => prev + completedTime);
      setSessions(prev => prev + 1);
      setMode('break');
      setTimeLeft(modes.break.duration);
    } else {
      setMode('focus');
      setTimeLeft(modes.focus.duration);
    }
    startTimeRef.current = null;
    initialTimeRef.current = null;
    playSound();
  }, [mode]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      // 记录开始时间
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
        initialTimeRef.current = timeLeft;
      }
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      // 暂停时重置开始时间
      startTimeRef.current = null;
      initialTimeRef.current = null;
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, handleTimerComplete]);

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
  };

  const switchMode = (newMode) => {
    // 切换模式时，如果正在运行，先保存当前已完成的进度
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
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 格式化小时和分钟
  const formatHours = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // 计算总专注时间
  const totalFocusTime = focusTime + deepworkTime;

  const logDistraction = () => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setDistractions(prev => [...prev, { time: timestamp, task: currentTask || 'No task set' }]);
  };

  const progress = ((modes[mode].duration - timeLeft) / modes[mode].duration) * 100;
  const ModeIcon = modes[mode].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Mode Selector */}
        <div className="flex gap-3 mb-8">
          {Object.entries(modes).map(([key, { label, icon: Icon, color }]) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                mode === key ? color + ' scale-105' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>

        {/* Main Timer */}
        <div className="bg-slate-800 rounded-2xl p-8 mb-6 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 mb-4">
              <ModeIcon size={32} className="text-slate-400" />
              <span className="text-2xl text-slate-300">{modes[mode].label}</span>
            </div>
            <div className="text-7xl font-bold mb-4 font-mono">{formatTime(timeLeft)}</div>
            <div className="w-full bg-slate-700 rounded-full h-3 mb-6">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${modes[mode].color}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex gap-4 justify-center mb-6">
            <button
              onClick={toggleTimer}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-semibold flex items-center gap-2 transition-all"
            >
              {isRunning ? <Pause size={24} /> : <Play size={24} />}
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={resetTimer}
              className="bg-slate-700 hover:bg-slate-600 px-8 py-4 rounded-lg font-semibold flex items-center gap-2 transition-all"
            >
              <RotateCcw size={24} />
              Reset
            </button>
          </div>

          {/* Task Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="What are you working on?"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Distraction Logger */}
          <button
            onClick={logDistraction}
            className="w-full bg-yellow-600 hover:bg-yellow-700 px-4 py-3 rounded-lg font-medium transition-all"
          >
            Log Distraction (caught myself!)
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">{sessions}</div>
            <div className="text-slate-400 text-sm">Sessions</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{formatHours(totalFocusTime)}</div>
            <div className="text-slate-400 text-sm">Total Focus</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{formatHours(deepworkTime)}</div>
            <div className="text-slate-400 text-sm">Deep Work</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">{distractions.length}</div>
            <div className="text-slate-400 text-sm">Distractions</div>
          </div>
        </div>

        {/* Distraction Log */}
        {distractions.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Distraction Log</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {distractions.slice().reverse().map((d, i) => (
                <div key={i} className="bg-slate-700 rounded px-4 py-2 flex justify-between text-sm">
                  <span className="text-slate-300">{d.task}</span>
                  <span className="text-slate-500">{d.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="mt-6 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <h4 className="font-semibold mb-2 text-slate-300">Pro Tips:</h4>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>• Close Slack/Discord during focus blocks</li>
            <li>• Use Deep Work mode for complex features</li>
            <li>• Log distractions to build awareness</li>
            <li>• Actually take breaks - your brain needs them</li>
          </ul>
        </div>
      </div>
    </div>
  );
}