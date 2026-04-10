"use client";

import { useEffect, useState } from "react";
import { useHasMounted } from "@/hooks/useHasMounted";
import Navbar from "@/components/Navbar";
import TaskList from "@/components/TaskList";
import toast from "react-hot-toast";
import { Trash2, Repeat, ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import ConfirmationModal from "@/components/ConfirmationModal";

interface Task {
  _id: string;
  title: string;
  description?: string;
  date: string;
  status: "pending" | "completed" | "missed";
  createdAt?: string;
  completedAt?: string;
}

interface Routine {
  _id: string;
  title: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly";
  startDate?: string;
  endDate?: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [showClearDayConfirm, setShowClearDayConfirm] = useState(false);
  
  // Calendar State
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const hasMounted = useHasMounted();
  
  // Use LOCAL date — browser is in IST (UTC+5:30), so local date = IST date.
  // Never use getUTC* here: between 12:00 AM and 5:30 AM IST the UTC date is still "yesterday".
  const getTodayStr = () => {
    const d = new Date();
    return [
      d.getFullYear(),
      ('0' + (d.getMonth() + 1)).slice(-2),
      ('0' + d.getDate()).slice(-2)
    ].join('-');
  }
  
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayStr());

  // IST today string (frontend: browser is in IST so local date IS IST)
  const todayStr = getTodayStr();

  const [taskType, setTaskType] = useState<"single" | "routine">("single");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: selectedDateStr,
    frequency: "none",
    startDate: selectedDateStr,
    endDate: selectedDateStr, // default same as start — user must pick a real end
  });

  const fetchData = async (viewDate?: Date) => {
    try {
      const d = viewDate || currentViewDate;
      const viewYear = d.getFullYear();
      const viewMonth = d.getMonth();
      const [tasksRes, routinesRes] = await Promise.all([
        fetch(`/api/tasks/get?viewYear=${viewYear}&viewMonth=${viewMonth}`),
        fetch("/api/routines/get")
      ]);
      
      const tasksData = await tasksRes.json();
      const routinesData = await routinesRes.json();
      
      if (tasksRes.ok) setTasks(tasksData.tasks);
      if (routinesRes.ok) setRoutines(routinesData.routines);
      
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentViewDate);
  }, []);

  // Update form dates when calendar selected date changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      date: selectedDateStr,
      // In routine mode: do NOT override the explicit start/end date inputs
      // when the user clicks a different calendar day — those inputs are independent.
      // In single mode: always sync the date field to the selected calendar day.
      ...(prev.frequency === 'none' ? { startDate: selectedDateStr } : {}),
    }));
  }, [selectedDateStr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.frequency === "none") {
        const res = await fetch("/api/tasks/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            date: formData.date
          }),
        });
        if (res.ok) {
          toast.success("Task created");
          setFormData({ ...formData, title: "", description: "" });
          fetchData();
        } else {
          const data = await res.json();
          toast.error(data.error || "Failed to create task");
        }
      } else {
        // Validate endDate for routines
        if (!formData.endDate) {
          toast.error("Please set an End Date for the routine.");
          return;
        }
        if (formData.endDate < formData.startDate) {
          toast.error("End Date cannot be before Start Date.");
          return;
        }
        // Guard against corrupted year from typing in the date input
        const endYear = new Date(formData.endDate).getFullYear();
        const startYear = new Date(formData.startDate).getFullYear();
        if (endYear > 2099 || startYear < 2020 || isNaN(endYear) || isNaN(startYear)) {
          toast.error("Please enter a valid date (year must be between 2020 and 2099).");
          return;
        }
        const res = await fetch("/api/routines/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            frequency: formData.frequency,
            startDate: formData.startDate,
            endDate: formData.endDate,
          }),
        });
        if (res.ok) {
          toast.success("Routine created! Tasks auto-generated.");
          // Reset everything back to single-task mode cleanly
          setTaskType("single");
          setFormData({ title: "", description: "", date: selectedDateStr, frequency: "none", startDate: selectedDateStr, endDate: selectedDateStr });
          // Seed past month first (if needed), then current — both awaited to prevent race condition
          const startObj = formData.startDate ? new Date(formData.startDate + "T12:00:00") : currentViewDate;
          if (startObj < currentViewDate) {
            await fetchData(startObj);
          }
          await fetchData(currentViewDate);
        } else {
          const data = await res.json();
          toast.error(data.error || "Failed to create routine");
        }
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      const res = await fetch("/api/tasks/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status }),
      });
      if (res.ok) {
        toast.success("Task updated");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      const res = await fetch(`/api/tasks/delete?taskId=${taskToDelete}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Task deleted");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to delete task");
    } finally {
      setTaskToDelete(null);
    }
  };

  const handleConfirmDeleteRoutine = async (purgeAll: boolean) => {
    if (!routineToDelete) return;
    try {
      const res = await fetch(`/api/routines/delete?routineId=${routineToDelete}&purgeAll=${purgeAll}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setRoutineToDelete(null);
        fetchData();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Failed to delete routine");
    }
  };

  const handleClearDay = async () => {
    try {
      const res = await fetch(`/api/tasks/bulk-delete?date=${selectedDateStr}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Day cleared successfully");
        fetchData();
      }
    } catch (error) {
      toast.error("Error clearing day");
    } finally {
      setShowClearDayConfirm(false);
    }
  };

  // Group tasks by UTC calendar date (matches how we store them: noon-UTC)
  const groupedTasks = tasks.reduce((acc, task) => {
    const d = new Date(task.date);
    // Use UTC date components since we store at noon UTC (never drifts)
    const dateStr = [
      d.getUTCFullYear(),
      ('0' + (d.getUTCMonth() + 1)).slice(-2),
      ('0' + d.getUTCDate()).slice(-2)
    ].join('-');
    
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // --- CALENDAR LOGIC ---
  const handlePrevMonth = () => {
    const newDate = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() - 1, 1);
    setCurrentViewDate(newDate);
    fetchData(newDate);
  };
  const handleNextMonth = () => {
    const newDate = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 1);
    setCurrentViewDate(newDate);
    fetchData(newDate);
  };

  const daysInMonth = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonthRaw = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), 1).getDay();
  const firstDayOfMonth = firstDayOfMonthRaw === 0 ? 6 : firstDayOfMonthRaw - 1;

  const getDayString = (day: number) => {
    return [
      currentViewDate.getFullYear(),
      ('0' + (currentViewDate.getMonth() + 1)).slice(-2),
      ('0' + day).slice(-2)
    ].join('-');
  }
  
  const calendarDays = [];
  // Empty blocks for offset
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-16 sm:h-20 border border-gray-100 bg-gray-50/50 rounded-xl"></div>);
  }
  // Actual Days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = getDayString(day);
    const dayTasks = groupedTasks[dateStr] || [];
    const isSelected = dateStr === selectedDateStr;
    const isToday = dateStr === getTodayStr();

    calendarDays.push(
      <div 
        key={day} 
        onClick={() => setSelectedDateStr(dateStr)}
        className={`h-16 sm:h-20 p-1.5 sm:p-2 border rounded-xl cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden
          ${isSelected ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500/50 shadow-sm shadow-indigo-100' : 'border-gray-200 bg-white hover:border-indigo-300'}
        `}
      >
        <div className="flex justify-between items-start">
          <span className={`text-[13px] sm:text-sm font-bold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg transition-colors ${
            isToday ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 
            isSelected ? 'text-indigo-700' : 'text-gray-700'
          }`}>
            {day}
          </span>
          {isToday && !isSelected && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1 mr-1" />}
        </div>
        
        {/* Render Task Dots - Horizontal Only, No Wrap Overflow */}
        <div className="flex gap-0.5 sm:gap-1 mt-auto pb-0.5 min-h-[8px]">
          {dayTasks.slice(0, 3).map((t, idx) => (
             <div 
              key={idx} 
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                t.status === 'completed' ? 'bg-green-500' : 
                t.status === 'missed' ? 'bg-red-500' : 'bg-indigo-400'
              }`}
             />
          ))}
          {dayTasks.length > 3 && (
            <span className="text-[8px] sm:text-[10px] text-gray-400 font-black leading-none self-center">
              +{dayTasks.length - 3}
            </span>
          )}
        </div>
      </div>
    );
  }

  const selectedTasks = groupedTasks[selectedDateStr] || [];
  const displayTodayStr = hasMounted ? getTodayStr() : "";

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      <Navbar />
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">

        {/* ── MAIN 2-COLUMN GRID ── */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT: Calendar */}
          <div className="flex-1 w-full min-w-0 lg:sticky lg:top-20 lg:self-start">
            {loading ? (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 animate-pulse">
                <div className="flex justify-between items-center mb-6">
                  <div className="h-7 bg-gray-200 rounded-lg w-40" />
                  <div className="flex gap-2">
                    <div className="h-9 w-9 bg-gray-100 rounded-md" />
                    <div className="h-9 w-16 bg-gray-100 rounded-md" />
                    <div className="h-9 w-9 bg-gray-100 rounded-md" />
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['M','T','W','T','F','S','S'].map((_,i) => <div key={i} className="h-4 bg-gray-100 rounded mx-auto w-6" />)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }).map((_,i) => <div key={i} className="h-20 bg-gray-100 rounded-lg" />)}
                </div>
              </div>
            ) : (
              <div className="w-full bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200/60 transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mr-3">
                      <CalendarIcon className="w-5 h-5 text-indigo-600" />
                    </div>
                    {currentViewDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                    <button onClick={handlePrevMonth} className="flex-1 sm:flex-none p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all"><ChevronLeft className="w-5 h-5 mx-auto"/></button>
                    <button onClick={() => setCurrentViewDate(new Date())} className="flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-white shadow-sm border border-gray-100 rounded-lg text-gray-700 hover:bg-gray-50 transition-all">Today</button>
                    <button onClick={handleNextMonth} className="flex-1 sm:flex-none p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all"><ChevronRight className="w-5 h-5 mx-auto"/></button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => (
                    <div key={day} className="text-center text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{day[0]}</span>
                    </div>
                  ))}
                  {calendarDays}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Quick Add (top) + Selected Day Tasks (below) */}
          <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-5">

            {/* ── QUICK ADD ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Gradient header band */}
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 pt-4 pb-5">
                <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                  <span>✦</span> Quick Add
                </h2>
                <div className="flex mt-3 bg-white/10 p-0.5 rounded-xl gap-0.5">
                  <button
                    type="button"
                    onClick={() => { setTaskType("single"); setFormData({...formData, frequency: "none", date: selectedDateStr}); }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-[10px] transition-all ${taskType === "single" ? 'bg-white text-indigo-700 shadow' : 'text-white/70 hover:text-white'}`}
                  >Specific Date</button>
                  <button
                    type="button"
                    onClick={() => { setTaskType("routine"); setFormData({...formData, frequency: "daily", startDate: selectedDateStr, endDate: selectedDateStr}); }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-[10px] transition-all ${taskType === "routine" ? 'bg-white text-indigo-700 shadow' : 'text-white/70 hover:text-white'}`}
                  >Date Range</button>
                </div>
              </div>

              {/* Form body */}
              <form onSubmit={handleSubmit} className="p-5 space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</label>
                    <span className={`text-[10px] font-bold ${formData.title.length >= 60 ? 'text-red-500' : 'text-gray-400'}`}>
                      {formData.title.length}/60
                    </span>
                  </div>
                  <input type="text" required value={formData.title} maxLength={60}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Read Physics Chapter 3"
                    className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Description <span className="normal-case font-normal text-gray-400">(optional)</span></label>
                    <span className={`text-[10px] font-bold ${formData.description.length >= 150 ? 'text-red-500' : 'text-gray-400'}`}>
                      {formData.description.length}/150
                    </span>
                  </div>
                  <textarea value={formData.description} maxLength={150}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                </div>

                {taskType === "single" ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Target Date</label>
                    <input type="date" required value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Recurrence</label>
                      <select value={formData.frequency}
                        onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                        className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="daily">Daily Routine</option>
                        <option value="weekly">Weekly Routine</option>
                        <option value="monthly">Monthly Routine</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Start Date <span className="text-red-500">*</span></label>
                        <input type="date" required min="2020-01-01" max="2099-12-31"
                          value={formData.startDate}
                          onChange={(e) => { const s = e.target.value; setFormData(p => ({...p, startDate: s, endDate: p.endDate < s ? s : p.endDate})); }}
                          className="block w-full text-sm font-semibold border-none bg-transparent p-0 focus:ring-0"
                        />
                      </div>
                      <div className="border-l pl-3">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">End Date <span className="text-red-500">*</span></label>
                        <input type="date" required min={formData.startDate} max="2099-12-31"
                          value={formData.endDate}
                          onChange={(e) => setFormData(p => ({...p, endDate: e.target.value}))}
                          className="block w-full text-sm font-semibold border-none bg-transparent p-0 focus:ring-0"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button type="submit"
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200 transition-all active:scale-95"
                >
                  {taskType === "single" ? "＋ Create Task" : "⚡ Activate Routine"}
                </button>
              </form>
            </div>

            {/* ── SELECTED DAY TASKS ── */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {new Date(selectedDateStr + "T12:00:00").toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}</p>
                </div>
                {selectedTasks.length > 0 && (
                  <button onClick={() => setShowClearDayConfirm(true)}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                  >Clear Day</button>
                )}
              </div>
              {selectedTasks.length === 0 ? (
                <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-400 text-sm">No tasks for this day.</p>
                  <p className="text-gray-300 text-xs mt-1">Use Quick Add above ↑</p>
                </div>
              ) : (
                <TaskList tasks={selectedTasks} onUpdateStatus={handleUpdateStatus} onDelete={(id) => setTaskToDelete(id)} todayStr={todayStr} />
              )}
            </div>
          </div>
        </div>

        {/* ── MANAGED ROUTINES — full-width horizontal chip strip below grid ── */}
        {routines.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Repeat className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Managed Routines</h2>
              <span className="ml-1 text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">{routines.length}</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {routines.map((rt) => (
                <div key={rt._id}
                  className="flex-shrink-0 flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 min-w-[220px] hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{rt.title}</p>
                    <p className="text-xs text-indigo-500 font-medium capitalize mt-0.5">{rt.frequency}</p>
                    <div className="flex gap-2 mt-1 text-[10px] text-gray-400 flex-wrap">
                      {rt.startDate && <span>From {new Date(new Date(rt.startDate).toISOString().slice(0,10)+"T12:00:00").toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>}
                      {rt.endDate && <span>→ {new Date(new Date(rt.endDate).toISOString().slice(0,10)+"T12:00:00").toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>}
                    </div>
                  </div>
                  <button onClick={() => setRoutineToDelete(rt._id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    title="Delete Routine"
                  ><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── ROUTINE DELETE MODAL ── */}
      {routineToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Routine</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">How aggressively do you want to delete this routine's footprint? This action can be partially destructive.</p>
            <div className="space-y-4">
              <button onClick={() => handleConfirmDeleteRoutine(false)}
                className="w-full text-left p-5 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-all group"
              >
                <span className="block font-bold text-blue-900 group-hover:text-indigo-600 transition-colors">Stop Safe (Recommended)</span>
                <span className="block text-xs text-blue-700/70 mt-1">Stops creating future tasks, but keeps all past tasks alive so your Completion Charts are preserved.</span>
              </button>
              <button onClick={() => handleConfirmDeleteRoutine(true)}
                className="w-full text-left p-5 rounded-2xl border border-red-100 bg-red-50/50 hover:bg-red-50 transition-all group"
              >
                <span className="block font-bold text-red-900 group-hover:text-red-600 transition-colors">Total Nuke</span>
                <span className="block text-xs text-red-700/70 mt-1">Aggressively strips ALL history (past and future) tied to this routine from your account permanently.</span>
              </button>
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={() => setRoutineToDelete(null)} className="px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOM CONFIRMATION MODALS ── */}
      <ConfirmationModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />

      <ConfirmationModal
        isOpen={showClearDayConfirm}
        onClose={() => setShowClearDayConfirm(false)}
        onConfirm={handleClearDay}
        title="Clear Entire Day"
        message={`This will permanently delete ALL tasks scheduled for ${selectedDateStr}. Are you absolutely sure?`}
        confirmText="Clear Day"
        type="danger"
      />
    </div>
  );
}
