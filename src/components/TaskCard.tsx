"use client";

import React, { useState } from "react";
import { useHasMounted } from "@/hooks/useHasMounted";
import { CheckCircle2, XCircle, Trash2, Clock, Circle, Eye, X, Pencil } from "lucide-react";

interface Task {
  _id: string;
  title: string;
  description?: string;
  date: string;
  status: "pending" | "completed" | "missed" | "partially-completed";
  createdAt?: string;
  completedAt?: string;
  targetDuration?: number;
  actualDuration?: number;
}

interface TaskProps {
  task: Task;
  onUpdateStatus: (taskId: string, status: string) => void;
  onDelete: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onLogProgress?: (taskId: string, minutes: number) => void;
  isPast: boolean;
  isFuture: boolean;
}

const formatDuration = (mins: number) => {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export default function TaskCard({ task, onUpdateStatus, onDelete, onEdit, onLogProgress, isPast, isFuture }: TaskProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [showLogTimeModal, setShowLogTimeModal] = useState(false);
  const [completionTime, setCompletionTime] = useState("");
  const hasMounted = useHasMounted();

  const isCompleted = task.status === "completed";
  const isPartiallyCompleted = task.status === "partially-completed";
  const isMissed = task.status === "missed";
  const isPending = task.status === "pending";
  const isDone = isCompleted || isPartiallyCompleted;

  const target = task.targetDuration || 0;
  const actual = task.actualDuration || 0;

  const getStatusClasses = () => {
    if (isCompleted) return "bg-green-50 border-green-200 shadow-sm";
    if (isPartiallyCompleted) return "bg-indigo-50 border-indigo-200 shadow-sm";
    if (isMissed) return "bg-red-50/60 border-red-200 opacity-80";
    if (actual > 0 && isPending) return "bg-indigo-50/10 border-indigo-100 ring-1 ring-indigo-50/50";
    if (isPast && isPending) return "bg-orange-50/60 border-orange-200 opacity-90";
    return "bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md";
  };

  // format date from UTC-midnight storage (IST safe)
  const d = new Date(task.date);
  const dateLabel = hasMounted ? d.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  }) : "";
 
  const createdLabel = (hasMounted && task.createdAt) ? new Date(task.createdAt).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }) : null;

  const completedLabel = (hasMounted && task.completedAt) ? new Date(task.completedAt).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }) : null;

  const progressPercent = target > 0 ? Math.min(Math.round((actual / target) * 100), 100) : 0;

  const handleOpenLogModal = () => {
    setShowLogTimeModal(true);
    setCompletionTime(actual.toString());
  };

  const handleFinalizeCompletion = () => {
    const mins = parseInt(completionTime) || actual;
    const finalStatus = mins >= target ? "completed" : "partially-completed";
    onUpdateStatus(task._id, finalStatus);
    if (onLogProgress) onLogProgress(task._id, mins - actual);
    setShowLogTimeModal(false);
  };

  return (
    <>
      <div className={`p-3 sm:p-4 rounded-xl border transition-all duration-300 flex justify-between items-center gap-3 group ${getStatusClasses()}`}>

        {/* Left Section */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Status Icon */}
          <button
            onClick={() => {
              if (!isDone && target > 0) {
                handleOpenLogModal();
              } else {
                onUpdateStatus(task._id, isDone ? "pending" : "completed");
              }
            }}
            className="shrink-0 transition-all active:scale-90"
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            ) : isPartiallyCompleted ? (
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
            ) : isMissed ? (
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
            ) : showLogTimeModal ? (
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            ) : (
              <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300 hover:text-green-400 transition-colors" />
            )}
          </button>

          {/* Title & Pipeline */}
          <div className="flex flex-col min-w-0">
            <h3 className={`text-sm sm:text-[15px] font-bold break-all line-clamp-1 ${isDone ? "text-gray-400 line-through" : isMissed ? "text-gray-500 line-through" : "text-gray-900"}`}>
              {task.title}
            </h3>
            {task.description && !isDone && !isMissed && (
              <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{task.description}</p>
            )}
            
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {target > 0 && (isPending || isPartiallyCompleted) ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 border border-indigo-100/50 rounded-lg shadow-[0_1px_2px_rgba(99,102,241,0.05)]">
                  <div className="flex -space-x-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`w-1 h-3 rounded-full ${progressPercent >= i * 33 ? 'bg-indigo-500' : 'bg-indigo-200'}`} />
                    ))}
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600">
                    {formatDuration(actual)} <span className="text-indigo-300 font-medium">/</span> {formatDuration(target)}
                  </span>
                </div>
              ) : actual > 0 ? (
                <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${isDone ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                  Spent {formatDuration(actual)}
                </span>
              ) : null}

              {isMissed && (
                <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-red-100 text-red-600">Missed</span>
              )}
              {isPast && isPending && (
                <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-orange-100 text-orange-600">Overdue</span>
              )}
              <div className="flex items-center text-[10px] text-gray-400 font-medium">
                <Clock className="w-3 h-3 mr-0.5 opacity-50" />{dateLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <button
            onClick={() => setShowDetail(true)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            title="View Details"
          >
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {!isDone && (
            <button
              onClick={() => {
                if (target > 0) handleOpenLogModal();
                else onUpdateStatus(task._id, "completed");
              }}
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
              title="Mark Completed"
            >
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {isPending && (
            <button
              onClick={() => onUpdateStatus(task._id, "missed")}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Mark Missed"
            >
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          <button
            onClick={() => onDelete(task._id)}
            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all border-l border-gray-100 ml-1 pl-1.5 sm:pl-2"
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Completion Modal */}
      {showLogTimeModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setShowLogTimeModal(false)}
        >
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full p-8 border border-white/20 animate-in zoom-in-95 duration-300 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
            
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100">
                <Clock className="w-8 h-8 text-indigo-600" />
              </div>
              
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Session Check-in</h2>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Great work! How many minutes did you study out of your <strong className="text-indigo-600">{formatDuration(target)}</strong> goal?
              </p>

              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="number"
                    autoFocus
                    value={completionTime}
                    onChange={(e) => setCompletionTime(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-xl text-center text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all font-black"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 uppercase tracking-widest pointer-events-none">Mins</span>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowLogTimeModal(false)} className="flex-1 py-4 text-sm font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all">Cancel</button>
                  <button onClick={handleFinalizeCompletion} className="flex-[2] py-4 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all uppercase tracking-widest">Confirm & Complete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowDetail(false)}>
          <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 border border-white/40 animate-in zoom-in-95 duration-300 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl" />
            
            <div className="flex items-start justify-between mb-6 relative">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 leading-tight">{task.title}</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Scheduled: {dateLabel}</p>
                {completedLabel && <p className="text-[10px] text-green-600 font-semibold mb-1">Completed: {completedLabel}</p>}
                {target > 0 && (
                  <span className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-indigo-100/50">
                    <Clock className="w-3 h-3" /> {formatDuration(target)} Study Goal
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {onEdit && (
                  <button onClick={() => { onEdit(task); setShowDetail(false); }} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Pencil className="w-5 h-5" /></button>
                )}
                <button onClick={() => setShowDetail(false)} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="mb-4">
              {isCompleted ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700"><CheckCircle2 className="w-4 h-4" /> Fully Completed</span> :
               isPartiallyCompleted ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700"><CheckCircle2 className="w-4 h-4" /> Partially Completed</span> :
               isMissed ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700"><XCircle className="w-4 h-4" /> Missed</span> :
               isPast ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-700"><Clock className="w-4 h-4" /> Overdue</span> :
               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-indigo-50 text-indigo-600"><Clock className="w-4 h-4" /> Pending</span>}
            </div>

            {target > 0 ? (
              <div className="mb-6 p-6 bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100/50 rounded-[2rem] shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Session Progress</span>
                    <span className="text-sm font-bold text-gray-900">{formatDuration(actual)} <span className="text-gray-300 font-medium">/</span> {formatDuration(target)}</span>
                  </div>
                  <div className="bg-white h-10 w-10 rounded-xl shadow-sm border border-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                    {progressPercent}%
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {[20, 40, 60, 80, 100].map((milestone) => (
                    <div key={milestone} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className={`h-1.5 w-full rounded-full transition-all duration-1000 ${progressPercent >= milestone ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'bg-gray-200'}`} />
                      <span className="text-[7px] font-bold text-gray-300 uppercase">{milestone}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-5 p-5 bg-gray-50/50 border border-dashed border-gray-200 rounded-3xl text-center">
                <p className="text-xs text-gray-400 font-medium italic">No study goal set for this task.</p>
                <button 
                  onClick={() => { onEdit && onEdit(task); setShowDetail(false); }}
                  className="mt-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  + Add Goal Time
                </button>
              </div>
            )}

            <div className="bg-gray-50 rounded-2xl p-4 mb-5 min-h-[80px]">
              {task.description ? <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{task.description}</p> : <p className="text-sm text-gray-400 italic">No description added.</p>}
            </div>

            <div className="flex gap-2">
              {!isDone && (
                <button onClick={() => { if (target > 0) handleOpenLogModal(); else onUpdateStatus(task._id, "completed"); setShowDetail(false); }} className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors">✓ Mark Complete</button>
              )}
              {isPending && (
                <button onClick={() => { onUpdateStatus(task._id, "missed"); setShowDetail(false); }} className="flex-1 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold transition-colors border border-red-200">✗ Mark Missed</button>
              )}
              {isDone || isMissed ? (
                <button onClick={() => { onUpdateStatus(task._id, "pending"); setShowDetail(false); }} className="flex-1 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-semibold transition-colors border border-gray-200">↺ Reset</button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
