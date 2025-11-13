import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Code, Zap, CheckCircle } from 'lucide-react';

const STORAGE_KEY = 'devFocusTimerData';

const getTodayKey = () => new Date().toDateString();

const loadData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      const todayKey = getTodayKey();
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
    focusTime: 0,
    deepworkTime: 0,
    distractions: []
  };
};

const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
};

const modes = {
  short: { duration: 15 * 60, label: 'Short Focus', icon: Code, color: 'bg-cyan-500' },
  focus: { duration: 25 * 60, label: 'Focus Block', icon: Code, color: 'bg-blue-500' },
  break: { duration: 5 * 60, label: 'Break', icon: Coffee, color: 'bg-green-500' },
  deepwork: { duration: 60 * 60, label: 'Deep Work', icon: Zap, color: 'bg-purple-500' }
};

export default function DevFocusTimer() {
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

  useEffect(() => {
    const data = loadData();
    const { sessions, focusTime, deepworkTime, distractions } = data;
    setSessions(sessions);
    setFocusTime(focusTime);
    setDeepworkTime(deepworkTime);
    setDistractions(distractions || []);
  }, []);

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
      const completedTime = initialTimeRef.current || modes[mode].duration;
      setFocusTime(prev => prev + completedTime);
      setSessions(prev => prev + 1);
      setMode('break');
      setTimeLeft(modes.break.duration);
      alert(`🎉 ${modes[mode].label} 完成！\n\n专注时间：${formatTime(completedTime)}\n\n该休息一下了！`);
    } else if (mode === 'deepwork') {
      const completedTime = initialTimeRef.current || modes.deepwork.duration;
      setDeepworkTime(prev => prev + completedTime);
      setSessions(prev => prev + 1);
      setMode('break');
      setTimeLeft(modes.break.duration);
      alert(`🎉 ${modes.deepwork.label} 完成！\n\n深度工作时间：${formatTime(completedTime)}\n\n该休息一下了！`);
    } else {
      setMode('focus');
      setTimeLeft(modes.focus.duration);
      alert(`✅ ${modes[mode].label} 完成！\n\n准备开始下一个专注时段！`);
    }
    startTimeRef.current = null;
    initialTimeRef.current = null;
    setHasProgress(false);
    playSound();
  }, [mode]);

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
        alert(`🎉 ${modes[mode].label} 完成！\n\n专注时间：${formatTime(completedTime)}\n\n该休息一下了！`);
      } else if (mode === 'deepwork') {
        setDeepworkTime(prev => prev + completedTime);
        setSessions(prev => prev + 1);
        setMode('break');
        setTimeLeft(modes.break.duration);
        alert(`🎉 ${modes.deepwork.label} 完成！\n\n深度工作时间：${formatTime(completedTime)}\n\n该休息一下了！`);
      } else {
        setMode('focus');
        setTimeLeft(modes.focus.duration);
        alert(`✅ ${modes[mode].label} 完成！\n\n准备开始下一个专注时段！`);
      }
    }
    
    startTimeRef.current = null;
    initialTimeRef.current = null;
    setHasProgress(false);
    playSound();
  }, [mode, timeLeft]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      // 如果是第一次启动，记录开始时间和初始时间
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
        if (initialTimeRef.current === null) {
          initialTimeRef.current = timeLeft;
          setHasProgress(true);
        }
      } else if (!prevIsRunningRef.current) {
        // 如果是从暂停恢复（isRunning 从 false 变为 true），调整开始时间以排除暂停的时间
        // 计算应该已经运行的时间，然后调整开始时间
        const elapsedSeconds = initialTimeRef.current - timeLeft;
        startTimeRef.current = Date.now() - elapsedSeconds * 1000;
      }
      prevIsRunningRef.current = true;
      
      // 使用基于时间戳的方式计算剩余时间，避免浏览器最小化时定时器被节流
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
      
      // 立即更新一次
      updateTimer();
      
      // 每100ms检查一次，确保时间准确
      intervalRef.current = setInterval(updateTimer, 100);
      
      // 监听页面可见性变化，当页面重新可见时立即更新
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && isRunning) {
          updateTimer();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        clearInterval(intervalRef.current);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else if (timeLeft === 0) {
      handleTimerComplete();
      prevIsRunningRef.current = false;
    } else {
      // 暂停时，清理定时器，但保留 startTimeRef 和 initialTimeRef
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      prevIsRunningRef.current = false;
    }
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
    setHasProgress(false);
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
            {hasProgress && timeLeft < modes[mode].duration && (
              <button
                onClick={finishTimer}
                className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg font-semibold flex items-center gap-2 transition-all"
              >
                <CheckCircle size={24} />
                Finish
              </button>
            )}
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