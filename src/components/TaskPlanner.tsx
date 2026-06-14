import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import { Task, STUDY_CATEGORIES_CONFIG, StudyCategory } from '../types';
import { Trash, CheckSquare, Square, Plus, AlertTriangle, Calendar, Star, Tags, Clock } from 'lucide-react';

interface TaskPlannerProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'userId'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export default function TaskPlanner({ tasks, onAddTask, onToggleTask, onDeleteTask }: TaskPlannerProps) {
  const { getCardColor } = useTheme();

  // Task creation local inputs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<StudyCategory>('dsa');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly'>('none');

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title,
      description,
      category,
      dueDate,
      priority,
      isCompleted: false,
      isRecurring,
      recurrence: isRecurring ? recurrence : 'none',
    });

    setTitle('');
    setDescription('');
    setIsRecurring(false);
    setRecurrence('none');
  };

  const getPriorityBadge = (p: 'low' | 'medium' | 'high') => {
    switch (p) {
      case 'high':
        return 'bg-red-950/40 text-red-400 border border-red-900/50';
      case 'medium':
        return 'bg-amber-950/40 text-amber-400 border border-amber-900/50';
      case 'low':
        return 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchCategory && matchPriority;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="study_planner">
      {/* Create Task Form Column */}
      <div className={`p-6 rounded-2xl ${getCardColor()} h-fit lg:col-span-1`}>
        <h3 className="text-sm font-bold tracking-tight text-zinc-200 mb-4 flex items-center gap-1.5 border-b border-zinc-800 pb-3">
          <Plus className="w-4 h-4 text-violet-400" />
          Add Study Task / Assignment
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">Task Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Practise 5 String problems on Leetcode"
              className="w-full bg-zinc-950 border border-zinc-850 py-2 px-3 text-xs text-white rounded-xl focus:outline-none focus:border-violet-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">Description (Optional)</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Reverse words, palindrome checks"
              className="w-full bg-zinc-950 border border-zinc-850 py-2 px-3 text-xs text-white rounded-xl focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StudyCategory)}
                className="w-full bg-zinc-950 border border-zinc-850 py-2 px-2.5 text-xs text-white rounded-xl focus:outline-none"
              >
                {Object.entries(STUDY_CATEGORIES_CONFIG).map(([key, config]) => (
                  <option key={key} value={key} className="bg-zinc-900">
                    {config.name.split(' ')[0]} {/* shortened */}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full bg-zinc-950 border border-zinc-850 py-2 px-2.5 text-xs text-white rounded-xl focus:outline-none"
              >
                <option value="low" className="bg-zinc-900 text-emerald-400">Low</option>
                <option value="medium" className="bg-zinc-900 text-amber-400">Medium</option>
                <option value="high" className="bg-zinc-900 text-red-400">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">Due Date</label>
            <input 
              type="date" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 py-2 px-3 text-xs text-white rounded-xl focus:outline-none focus:border-violet-500"
              required
            />
          </div>

          {/* Recurring section */}
          <div className="bg-zinc-950/30 p-3 rounded-xl border border-zinc-850/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">Set as Recurring Task</span>
              <input 
                type="checkbox" 
                checked={isRecurring}
                onChange={(e) => {
                  setIsRecurring(e.target.checked);
                  if (e.target.checked) setRecurrence('daily');
                  else setRecurrence('none');
                }}
                className="w-4 h-4 text-violet-500 rounded focus:ring-violet-500"
              />
            </div>

            {isRecurring && (
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold mb-1 uppercase tracking-wider">Recurrence Cycle</label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as 'daily' | 'weekly')}
                  className="w-full bg-zinc-950 border border-zinc-800 py-1.5 px-2 text-xs text-white rounded focus:outline-none"
                >
                  <option value="daily" className="bg-zinc-900">Every Single Day</option>
                  <option value="weekly" className="bg-zinc-900">Once a Week</option>
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs transition shadow"
          >
            Create Task
          </button>
        </form>
      </div>

      {/* Task List Column */}
      <div className={`p-6 rounded-2xl ${getCardColor()} lg:col-span-2 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-3">
          <h3 className="text-sm font-bold tracking-tight text-zinc-200 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Your Study Tasks & Deadlines ({filteredTasks.length})
          </h3>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-zinc-950 border border-zinc-850 text-[10px] text-zinc-300 font-semibold py-1 px-2.5 rounded-lg focus:outline-none"
            >
              <option value="all">All Categories</option>
              {Object.entries(STUDY_CATEGORIES_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.name.split(' ')[0]}</option>
              ))}
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-zinc-950 border border-zinc-850 text-[10px] text-zinc-300 font-semibold py-1 px-2.5 rounded-lg focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            <Clock className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            No tasks found matching current filters. Log a new task to organize your study progress!
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {filteredTasks.map(task => (
              <div 
                key={task.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                  task.isCompleted 
                    ? 'bg-zinc-950/20 border-zinc-900 opacity-60' 
                    : 'bg-zinc-900/60 border-zinc-850 hover:bg-zinc-900/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 text-zinc-500 hover:text-emerald-400 transition"
                  >
                    {task.isCompleted ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <div>
                    <h4 className={`text-xs font-bold ${task.isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">{task.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[9px] bg-zinc-800 text-zinc-400 font-semibold px-2 py-0.5 rounded-lg border border-zinc-750">
                        {STUDY_CATEGORIES_CONFIG[task.category]?.name.split(' ')[0]}
                      </span>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-lg ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.isRecurring && (
                        <span className="text-[9px] bg-indigo-950/40 text-indigo-400 font-semibold px-2 py-0.5 rounded-lg border border-indigo-900/40 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 inline" />
                          Recurring: {task.recurrence}
                        </span>
                      )}
                      <span className="text-[9px] text-zinc-500 font-medium">
                        Due: {task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 bg-zinc-950/30 hover:bg-red-950/40 rounded-lg text-zinc-500 hover:text-red-400 transition"
                    title="Delete task"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
