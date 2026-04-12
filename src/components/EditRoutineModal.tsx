"use client";

import React, { useState, useEffect } from "react";
import { X, Repeat, Type, AlignLeft, Save } from "lucide-react";

interface Routine {
  _id: string;
  title: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly";
}

interface EditRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (routineId: string, updates: Partial<Routine>) => Promise<void>;
  routine: Routine | null;
}

export default function EditRoutineModal({ isOpen, onClose, onUpdate, routine }: EditRoutineModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (routine) {
      setFormData({
        title: routine.title,
        description: routine.description || ""
      });
    }
  }, [routine]);

  if (!isOpen || !routine) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(routine._id, formData);
      onClose();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <form 
        onSubmit={handleSubmit}
        className="bg-white w-full h-full sm:h-auto sm:max-w-md sm:rounded-3xl shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 flex justify-between items-center sm:rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <Repeat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Edit Routine</h2>
              <p className="text-xs text-white/70">Modify routine settings</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
              <Type className="w-3.5 h-3.5" /> Routine Title
            </label>
            <input 
              type="text" 
              required 
              value={formData.title}
              maxLength={60}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Morning Workout"
              className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
              <AlignLeft className="w-3.5 h-3.5" /> Description
            </label>
            <textarea 
              value={formData.description}
              maxLength={150}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="What is this routine about?"
              rows={4}
              className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm resize-none"
            />
            <div className="flex justify-end pr-1">
              <span className={`text-[10px] font-bold ${formData.description.length >= 150 ? 'text-red-500' : 'text-gray-400'}`}>
                {formData.description.length}/150
              </span>
            </div>
          </div>

          <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2">Recurrence Level</p>
            <div className="flex items-center gap-2 text-indigo-700">
               <span className="text-xs font-bold capitalize bg-indigo-100 px-3 py-1 rounded-full">{routine.frequency}</span>
               <span className="text-[10px] text-indigo-400">(Recurrence cannot be changed after creation)</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3 sm:rounded-b-3xl">
          <button type="button" onClick={onClose} className="flex-1 py-3.5 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-2xl hover:bg-gray-100 transition-all shadow-sm">Cancel</button>
          <button type="submit" disabled={loading} className="flex-3 py-3.5 px-8 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save Routine</>}
          </button>
        </div>
      </form>
    </div>
  );
}
