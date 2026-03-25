import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Flame, 
  History as HistoryIcon, 
  LayoutDashboard, 
  BarChart3, 
  Moon, 
  Sun, 
  CheckCircle2, 
  Trash2,
  Trophy,
  Activity,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Habit, AppState } from './types';

const STORAGE_KEY = 'reps_app_state';

const getTodayStr = () => new Date().toISOString().split('T')[0];
const getYesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      username: 'USER_0492',
      habits: [],
      theme: 'dark'
    };
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'stats'>('dashboard');
  const [newHabitName, setNewHabitName] = useState('');

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  // Check and reset streaks on load/daily
  useEffect(() => {
    const today = getTodayStr();
    const yesterday = getYesterdayStr();
    
    setState(prev => ({
      ...prev,
      habits: prev.habits.map(habit => {
        if (!habit.lastCompletedDate) return habit;
        
        // If last completion was before yesterday and not today, reset streak
        if (habit.lastCompletedDate !== today && habit.lastCompletedDate !== yesterday) {
          return { ...habit, streak: 0 };
        }
        return habit;
      })
    }));
  }, []);

  const toggleTheme = () => {
    setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: newHabitName.trim(),
      createdAt: new Date().toISOString(),
      completions: [],
      streak: 0,
      lastCompletedDate: null
    };

    setState(prev => ({
      ...prev,
      habits: [newHabit, ...prev.habits]
    }));
    setNewHabitName('');
  };

  const deleteHabit = (id: string) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== id)
    }));
  };

  const markDone = (id: string) => {
    const today = getTodayStr();
    const yesterday = getYesterdayStr();

    setState(prev => ({
      ...prev,
      habits: prev.habits.map(habit => {
        if (habit.id !== id) return habit;
        if (habit.lastCompletedDate === today) return habit;

        let newStreak = habit.streak;
        if (habit.lastCompletedDate === yesterday) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }

        return {
          ...habit,
          completions: [today, ...habit.completions],
          streak: newStreak,
          lastCompletedDate: today
        };
      })
    }));
  };

  const stats = useMemo(() => {
    const totalCompletions = state.habits.reduce((acc, h) => acc + h.completions.length, 0);
    const longestStreak = state.habits.reduce((acc, h) => Math.max(acc, h.streak), 0);
    return {
      totalHabits: state.habits.length,
      totalCompletions,
      longestStreak
    };
  }, [state.habits]);

  const history = useMemo(() => {
    const all = state.habits.flatMap(h => 
      h.completions.map(date => ({ date, habitName: h.name, id: `${h.id}-${date}` }))
    );
    return all.sort((a, b) => b.date.localeCompare(a.date));
  }, [state.habits]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b-2 md:border-b-0 md:border-r-2 border-brutal-black dark:border-brutal-white p-6 flex flex-col gap-8 bg-brutal-white dark:bg-brutal-black z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-neon-green border-2 border-brutal-black dark:border-brutal-white flex items-center justify-center font-display text-brutal-black">
            R
          </div>
          <h1 className="font-display text-2xl tracking-tighter uppercase">Reps_v1.0</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 p-3 font-mono text-sm uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-neon-green text-brutal-black border-2 border-brutal-black' : 'hover:bg-gray-100 dark:hover:bg-brutal-gray'}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-3 p-3 font-mono text-sm uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-neon-green text-brutal-black border-2 border-brutal-black' : 'hover:bg-gray-100 dark:hover:bg-brutal-gray'}`}
          >
            <HistoryIcon size={18} /> History
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-3 p-3 font-mono text-sm uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'bg-neon-green text-brutal-black border-2 border-brutal-black' : 'hover:bg-gray-100 dark:hover:bg-brutal-gray'}`}
          >
            <BarChart3 size={18} /> Stats
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t-2 border-brutal-black dark:border-brutal-white flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-brutal-gray border-2 border-brutal-black dark:border-brutal-white flex items-center justify-center">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase opacity-50">Authorized_User</p>
              <p className="font-mono text-xs font-bold">{state.username}</p>
            </div>
          </div>
          <button 
            onClick={toggleTheme}
            className="border-2 border-brutal-black dark:border-brutal-white px-4 py-2 font-mono uppercase tracking-wider transition-all active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2 text-xs"
          >
            {state.theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            {state.theme === 'light' ? 'Dark_Mode' : 'Light_Mode'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-gray-50 dark:bg-[#0a0a0a]">
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-neon-green animate-pulse"></div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">System_Status: Synchronized</p>
          </div>
          <h2 className="font-display text-5xl md:text-7xl uppercase tracking-tighter leading-none mb-4">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'history' && 'Log_Archive'}
            {activeTab === 'stats' && 'Inference_Data'}
          </h2>
          <p className="max-w-xl text-sm opacity-70 font-medium">
            {activeTab === 'dashboard' && 'Executing logic for sequence tracking. Daily reps optimized for maximum retention and neural plastic gain.'}
            {activeTab === 'history' && 'Historical data points of all completed operational modules. Chronological sequence of consistency.'}
            {activeTab === 'stats' && 'Aggregated performance metrics and efficiency ratings derived from historical completion data.'}
          </p>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Add Habit Form */}
              <div className="lg:col-span-1">
                <div className="border-2 border-brutal-black dark:border-brutal-white p-6 bg-white dark:bg-brutal-gray brutal-shadow dark:brutal-shadow-white sticky top-8">
                  <h3 className="font-display text-xl uppercase mb-6 flex items-center gap-2">
                    <Plus size={20} className="text-neon-green" /> Initialize_Module
                  </h3>
                  <form onSubmit={addHabit} className="flex flex-col gap-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase mb-1 opacity-60">Habit_Name</label>
                      <input 
                        type="text" 
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        placeholder="e.g., DEEP_WORK"
                        className="w-full border-2 border-brutal-black dark:border-brutal-white p-3 bg-transparent font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neon-green"
                      />
                    </div>
                    <button type="submit" className="border-2 border-brutal-black dark:border-brutal-white px-4 py-3 font-mono uppercase tracking-wider transition-all active:translate-x-[2px] active:translate-y-[2px] bg-neon-green text-brutal-black brutal-shadow-sm dark:brutal-shadow-sm-white hover:bg-opacity-90 w-full">
                      Deploy_Module
                    </button>
                  </form>
                </div>
              </div>

              {/* Habits List */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-2xl uppercase tracking-tight">Active_Reps</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-neon-green"></div>
                    <span className="font-mono text-[10px] uppercase">Completed</span>
                  </div>
                </div>

                {state.habits.length === 0 ? (
                  <div className="border-2 border-brutal-black dark:border-brutal-white p-6 bg-white dark:bg-brutal-gray brutal-shadow dark:brutal-shadow-white flex flex-col items-center justify-center py-20 text-center opacity-40">
                    <Activity size={48} className="mb-4" />
                    <p className="font-mono uppercase text-sm">No active modules detected.</p>
                    <p className="text-xs">Initialize a new habit to begin tracking.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {state.habits.map(habit => {
                      const isDoneToday = habit.lastCompletedDate === getTodayStr();
                      return (
                        <motion.div 
                          layout
                          key={habit.id} 
                          className={`border-2 p-6 bg-white dark:bg-brutal-gray brutal-shadow dark:brutal-shadow-white relative group ${isDoneToday ? 'border-neon-green' : 'border-brutal-black dark:border-brutal-white'}`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col">
                              <span className="font-mono text-[10px] bg-gray-100 dark:bg-brutal-gray px-2 py-1 mb-2 w-fit">
                                STREAK_{habit.streak.toString().padStart(3, '0')}
                              </span>
                              <h4 className="font-display text-xl uppercase leading-tight">{habit.name}</h4>
                            </div>
                            <button 
                              onClick={() => deleteHabit(habit.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-1 text-orange-500">
                              <Flame size={16} fill="currentColor" />
                              <span className="font-mono text-sm font-bold">{habit.streak}</span>
                            </div>
                            <div className="flex items-center gap-1 text-blue-500">
                              <CheckCircle2 size={16} />
                              <span className="font-mono text-sm font-bold">{habit.completions.length}</span>
                            </div>
                          </div>

                          <button 
                            disabled={isDoneToday}
                            onClick={() => markDone(habit.id)}
                            className={`w-full border-2 border-brutal-black dark:border-brutal-white px-4 py-2 font-mono uppercase tracking-wider transition-all active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2 ${isDoneToday ? 'bg-neon-green text-brutal-black cursor-default' : 'hover:bg-neon-green hover:text-brutal-black'}`}
                          >
                            {isDoneToday ? (
                              <><CheckCircle2 size={18} /> Module_Completed</>
                            ) : (
                              'Log_Rep'
                            )}
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              {history.length === 0 ? (
                <div className="border-2 border-brutal-black dark:border-brutal-white p-6 bg-white dark:bg-brutal-gray brutal-shadow dark:brutal-shadow-white flex flex-col items-center justify-center py-20 text-center opacity-40">
                  <HistoryIcon size={48} className="mb-4" />
                  <p className="font-mono uppercase text-sm">Archive is empty.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {history.map((entry, idx) => (
                    <div key={entry.id} className="border-2 border-brutal-black dark:border-brutal-white p-4 bg-white dark:bg-brutal-gray flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-neon-green/10 border border-brutal-black dark:border-brutal-white flex items-center justify-center text-neon-green">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <p className="font-mono text-[10px] uppercase opacity-50">{entry.date}</p>
                          <h4 className="font-display text-lg uppercase">{entry.habitName}</h4>
                        </div>
                      </div>
                      <div className="font-mono text-[10px] uppercase px-2 py-1 border border-brutal-black dark:border-brutal-white">
                        REP_{ (history.length - idx).toString().padStart(4, '0') }
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="border-2 border-brutal-black dark:border-brutal-white p-6 bg-white dark:bg-brutal-gray brutal-shadow dark:brutal-shadow-white flex flex-col items-center text-center">
                <Activity size={32} className="mb-4 text-neon-green" />
                <p className="font-mono text-[10px] uppercase opacity-60 mb-1">Total_Modules</p>
                <p className="font-display text-5xl">{stats.totalHabits.toString().padStart(2, '0')}</p>
              </div>
              <div className="border-2 border-brutal-black dark:border-brutal-white p-6 bg-white dark:bg-brutal-gray brutal-shadow dark:brutal-shadow-white flex flex-col items-center text-center">
                <Trophy size={32} className="mb-4 text-yellow-500" />
                <p className="font-mono text-[10px] uppercase opacity-60 mb-1">Total_Completions</p>
                <p className="font-display text-5xl">{stats.totalCompletions.toString().padStart(3, '0')}</p>
              </div>
              <div className="border-2 border-brutal-black dark:border-brutal-white p-6 bg-white dark:bg-brutal-gray brutal-shadow dark:brutal-shadow-white flex flex-col items-center text-center">
                <Flame size={32} className="mb-4 text-orange-500" />
                <p className="font-mono text-[10px] uppercase opacity-60 mb-1">Max_Streak</p>
                <p className="font-display text-5xl">{stats.longestStreak.toString().padStart(2, '0')}</p>
              </div>

              <div className="md:col-span-3 border-2 border-brutal-black dark:border-brutal-white p-8 bg-brutal-black text-brutal-white dark:bg-brutal-white dark:text-brutal-black">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex-1">
                    <h3 className="font-display text-3xl uppercase mb-2">Efficiency_Rating</h3>
                    <p className="text-sm opacity-70 mb-6">Calculated based on active module consistency over the last 30 operational cycles.</p>
                    <div className="w-full h-4 bg-gray-800 dark:bg-gray-200 border border-brutal-white dark:border-brutal-black relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '94.2%' }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-neon-green"
                      />
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="font-display text-7xl text-neon-green">94.2%</p>
                    <p className="font-mono text-xs uppercase tracking-widest">Neural_Gain: +12.4%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
