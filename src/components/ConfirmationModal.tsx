"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger"
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
          button: "bg-red-600 hover:bg-red-700 shadow-red-200",
          bg: "bg-red-50"
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          button: "bg-amber-600 hover:bg-amber-700 shadow-amber-200",
          bg: "bg-amber-50"
        };
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-indigo-600" />,
          button: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200",
          bg: "bg-indigo-50"
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-black/40 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className={`w-12 h-12 ${styles.bg} rounded-2xl flex items-center justify-center`}>
              {styles.icon}
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>

        <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-2 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all border border-gray-100"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 text-sm font-bold text-white ${styles.button} rounded-2xl shadow-lg transition-all active:scale-95`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
