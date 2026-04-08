import { useState, useEffect, useRef } from 'react';
import useTaskStore from '../store/taskStore';

const priorityColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-600',
  'in-progress': 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

const TaskCard = ({ task, onEdit }) => {
  const { deleteTask, updateTask } = useTaskStore();
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isBreak, setIsBreak] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (pomodoroActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setPomodoroActive(false);
            if (!isBreak) {
              setIsBreak(true);
              setTimeLeft(5 * 60);
              new Audio('https://www.soundjay.com/buttons/sounds/button-09a.mp3').play().catch(() => {});
              alert('🍅 Pomodoro done! Take a 5 min break.');
            } else {
              setIsBreak(false);
              setTimeLeft(25 * 60);
              alert('☕ Break over! Back to work.');
            }
            return prev;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [pomodoroActive]);

  const togglePomodoro = () => setPomodoroActive((prev) => !prev);

  const resetPomodoro = () => {
    setPomodoroActive(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleStatus = () => {
    const next = task.status === 'completed' ? 'pending' : task.status === 'pending' ? 'in-progress' : 'completed';
    updateTask(task.id, { status: next });
  };

  const progress = isBreak
    ? ((5 * 60 - timeLeft) / (5 * 60)) * 100
    : ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800 text-base">{task.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {task.description && <p className="text-sm text-gray-500 mb-3">{task.description}</p>}

      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[task.status]}`}>
            {task.status}
          </span>
          {task.dueDate && <span className="text-xs text-gray-400">Due: {task.dueDate}</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPomodoro(!showPomodoro)}
            className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-600 px-2 py-1 rounded">
            🍅
          </button>
          <button onClick={toggleStatus}
            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded">
            Progress
          </button>
          <button onClick={() => onEdit(task)}
            className="text-xs bg-yellow-50 hover:bg-yellow-100 text-yellow-600 px-2 py-1 rounded">
            Edit
          </button>
          <button onClick={() => deleteTask(task.id)}
            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded">
            Delete
          </button>
        </div>
      </div>

      {showPomodoro && (
        <div className="border-t border-gray-100 pt-3 mt-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">
              {isBreak ? '☕ Break Time' : '🍅 Focus Time'}
            </span>
            <span className="text-lg font-bold text-gray-800 font-mono">{formatTime(timeLeft)}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
            <div
              className={`h-1.5 rounded-full transition-all ${isBreak ? 'bg-blue-400' : 'bg-orange-400'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={togglePomodoro}
              className={`flex-1 text-xs py-1.5 rounded-lg font-medium ${pomodoroActive ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`}>
              {pomodoroActive ? '⏸ Pause' : '▶ Start'}
            </button>
            <button onClick={resetPomodoro}
              className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
              ↺ Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;