"use client";

import React from "react";
import { X, Repeat, Calendar, Pencil, Trash2, Clock, AlignLeft } from "lucide-react";

interface Routine {
  _id: string;
  title: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly";
  startDate?: string;
  endDate?: string;
  targetDuration?: number;
}

interface RoutineDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (routine: Routine) => void;
  onDelete: (routineId: string) => void;
  routine: Routine | null;
}

const formatDuration = (mins: number) => {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export default function RoutineDetailModal({ isOpen, onClose, onEdit, onDelete, routine }: RoutineDetailModalProps) {
  if (!isOpen || !routine) return null;

  const formatDate = (dateValue?: any) => {
    if (!dateValue) return "N/A";
    try {
      const d = new Date(dateValue);
      if (isNaN(d.getTime())) return "N/A";
      // Ensure we extract the pure YYYY-MM-DD to avoid time/timezone shifts
      const iso = d.toISOString().slice(0, 10);
      return new Date(iso + "T12:00:00").toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-0 border border-gray-100 animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-indigo-50 px-6 py-6 flex flex-col items-center relative text-center">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
            <Repeat className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">{routine.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded-full">
              {routine.frequency} Routine
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div className="space-y-2">
             <div className="flex items-center gap-2 text-gray-400">
               <AlignLeft className="w-4 h-4" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Description</span>
             </div>
             <div className="bg-gray-50 rounded-2xl p-4 min-h-[80px]">
               {routine.description ? (
                 <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{routine.description}</p>
               ) : (
                 <p className="text-sm text-gray-400 italic">No description added.</p>
               )}
             </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 p-3 rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Starts From</span>
                </div>
                <p className="text-xs font-bold text-gray-800">{formatDate(routine.startDate)}</p>
            </div>
            <div className="space-y-1.5 p-3 rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Valid Until</span>
                </div>
                <p className="text-xs font-bold text-gray-800">{routine.endDate ? formatDate(routine.endDate) : "Indefinite"}</p>
            </div>
          </div>
          
          {/* Study Goal Section */}
          {(routine as any).targetDuration > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-400">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Study Goal</span>
              </div>
              <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Planned session duration</span>
                <span className="text-sm font-bold text-indigo-600 bg-white px-3 py-1 rounded-xl shadow-sm">
                  {formatDuration((routine as any).targetDuration)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 pb-6 pt-2 flex gap-3">
          <button
            onClick={() => { onEdit(routine); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-2xl transition-all"
          >
            <Pencil className="w-4 h-4" /> Edit Details
          </button>
          <button
            onClick={() => { onDelete(routine._id); onClose(); }}
            className="flex items-center justify-center p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-2xl transition-all"
            title="Delete Routine"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
