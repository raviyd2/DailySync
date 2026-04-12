"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Type, AlignLeft, Save } from "lucide-react";

interface Task {
  _id: string;
  title: string;
  description?: string;
  date: string;
  status: "pending" | "completed" | "missed";
}

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  task: Task | null;
}

export default function EditTaskModal({ isOpen, onClose, onUpdate, task }: EditTaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      // task.date is stored as YYYY-MM-DD or ISO string, but the date input needs YYYY-MM-DD
      const dateObj = new Date(task.date);
      const year = dateObj.getUTCFullYear();
      const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getUTCDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      setFormData({
        title: task.title,
        description: task.description || "",
        date: formattedDate
      });
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(task._id, formData);
      onClose();
    } catch (error) {
      // Error handling is managed by the parent via toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <form 
        onSubmit={handleSubmit}
        className="bg-white w-full h-full sm:h-auto sm:max-w-md sm:rounded-3xl shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200 sm:slide-in-from-bottom-0 slide-in-from-bottom-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 flex justify-between items-center sm:rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Edit Task</h2>
              <p className="text-xs text-white/70">Modify your task details</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {/* Title Field */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
              <Type className="w-3.5 h-3.5" /> Title
            </label>
            <input 
              type="text" 
              required 
              value={formData.title}
              maxLength={60}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter task title..."
              className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
              autoFocus
            />
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
              <AlignLeft className="w-3.5 h-3.5" /> Description
            </label>
            <textarea 
              value={formData.description}
              maxLength={150}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Add some details (optional)"
              rows={4}
              className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm resize-none"
            />
            <div className="flex justify-end pr-1">
              <span className={`text-[10px] font-bold ${formData.description.length >= 150 ? 'text-red-500' : 'text-gray-400'}`}>
                {formData.description.length}/150
              </span>
            </div>
          </div>

          {/* Date Field */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
              <Calendar className="w-3.5 h-3.5" /> Target Date
            </label>
            <div className="relative">
              <input 
                type="date" 
                required 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3 sm:rounded-b-3xl mt-auto">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-2xl hover:bg-gray-100 hover:text-gray-700 transition-all shadow-sm active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-3 py-3.5 px-8 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
