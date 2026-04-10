"use client";

import React, { useState } from "react";
import { useHasMounted } from "@/hooks/useHasMounted";
import { CheckCircle2, XCircle, Trash2, Clock, Circle, Eye, X } from "lucide-react";

interface Task {
  _id: string;
  title: string;
  description?: string;
  date: string;
  status: "pending" | "completed" | "missed";
  createdAt?: string;
  completedAt?: string;
}

interface TaskProps {
  task: Task;
  onUpdateStatus: (taskId: string, status: string) => void;
  onDelete: (taskId: string) => void;
  isPast: boolean;
  isFuture: boolean;
}

export default function TaskCard({ task, onUpdateStatus, onDelete, isPast, isFuture }: TaskProps) {
  const [showDetail, setShowDetail] = useState(false);
  const hasMounted = useHasMounted();

  const isCompleted = task.status === "completed";
  const isMissed = task.status === "missed";
  const isPending = task.status === "pending";


  const getStatusClasses = () => {
    if (isCompleted) return "bg-green-50 border-green-200";
    if (isMissed) return "bg-red-50/60 border-red-200 opacity-80";
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

  return (
    <>
      <div className={`p-3 sm:p-4 rounded-xl border transition-all duration-300 flex justify-between items-center gap-3 group ${getStatusClasses()}`}>

        {/* Left: status icon + title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Quick toggle circle */}
          <button
            onClick={() => onUpdateStatus(task._id, isCompleted ? "pending" : "completed")}
            className="shrink-0 transition-colors"
            title={isCompleted ? "Mark Pending" : "Mark Complete"}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            ) : isMissed ? (
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
            ) : (
              <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300 hover:text-green-400" />
            )}
          </button>

          <div className="flex flex-col min-w-0">
            <h3 className={`text-sm sm:text-[15px] font-bold break-all line-clamp-2 ${isCompleted ? "text-gray-400 line-through" : isMissed ? "text-gray-500 line-through" : "text-gray-900"}`}>
              {task.title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {task.description && (
                <p className="text-xs text-gray-400 truncate max-w-[160px]">{task.description}</p>
              )}
              {isMissed && (
                <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-red-100 text-red-600">Missed</span>
              )}
              {isPast && isPending && (
                <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-orange-100 text-orange-600">Overdue</span>
              )}
              <div className="flex items-center text-[10px] text-gray-400">
                <Clock className="w-3 h-3 mr-0.5" />{dateLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity focus-within:opacity-100"
          style={{ opacity: (isCompleted || isMissed) ? 1 : undefined }}>
          
          {/* View detail */}
          <button
            onClick={() => setShowDetail(true)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Complete */}
          {task.status !== "completed" && (
            <button
              onClick={() => onUpdateStatus(task._id, "completed")}
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
              title="Mark Completed"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}

          {/* Missed */}
          {task.status !== "missed" && (
            <button
              onClick={() => onUpdateStatus(task._id, "missed")}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Mark Missed"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}

          {/* Delete */}
          <button
            onClick={() => onDelete(task._id)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors border-l ml-0.5 pl-1.5"
            title="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowDetail(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5 sm:p-6 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 leading-tight break-all">{task.title}</h2>
                <div className="flex flex-col gap-0.5 mt-1">
                  <p className="text-sm text-gray-500 font-medium">Scheduled: {dateLabel}</p>
                  {createdLabel && (
                    <p className="text-[10px] text-gray-400">Created: {createdLabel}</p>
                  )}
                  {completedLabel && (
                    <p className="text-[10px] text-green-600 font-semibold">Completed: {completedLabel}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Badge */}
            <div className="mb-4">
              {isCompleted && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                  <CheckCircle2 className="w-4 h-4" /> Completed
                </span>
              )}
              {isMissed && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                  <XCircle className="w-4 h-4" /> Missed
                </span>
              )}
              {isPending && isPast && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-700">
                  <Clock className="w-4 h-4" /> Overdue
                </span>
              )}
              {isPending && isFuture && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700">
                  <Clock className="w-4 h-4" /> Upcoming
                </span>
              )}
              {isPending && !isPast && !isFuture && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">
                  <Clock className="w-4 h-4" /> Due Today
                </span>
              )}
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-5 min-h-[60px] sm:min-h-[80px]">
              {task.description ? (
                <p className="text-sm text-gray-700 leading-relaxed break-all whitespace-pre-wrap">{task.description}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">No description added.</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              {task.status !== "completed" && (
                <button
                  onClick={() => { onUpdateStatus(task._id, "completed"); setShowDetail(false); }}
                  className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors"
                >
                  ✓ Mark Complete
                </button>
              )}
              {task.status !== "missed" && (
                <button
                  onClick={() => { onUpdateStatus(task._id, "missed"); setShowDetail(false); }}
                  className="flex-1 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold transition-colors border border-red-200"
                >
                  ✗ Mark Missed
                </button>
              )}
              {task.status !== "pending" && (
                <button
                  onClick={() => { onUpdateStatus(task._id, "pending"); setShowDetail(false); }}
                  className="flex-1 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-semibold transition-colors border border-gray-200"
                >
                  ↺ Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
