import React from "react";
import TaskCard from "./TaskCard";

interface Task {
  _id: string;
  title: string;
  description?: string;
  date: string;
  status: "pending" | "completed" | "missed";
  createdAt?: string;
  completedAt?: string;
}

interface TaskListProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, status: string) => void;
  onDelete: (taskId: string) => void;
  todayStr: string;
}

export default function TaskList({ tasks, onUpdateStatus, onDelete, todayStr }: TaskListProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <p className="text-sm text-gray-500">No tasks for this day.</p>
        <p className="text-xs text-gray-400 mt-1">Add one using the Quick Add form below.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2.5">
      {tasks.map((task) => {
        // Compute past/future from stored UTC date vs IST today
        const taskDateStr = [
          new Date(task.date).getUTCFullYear(),
          ("0" + (new Date(task.date).getUTCMonth() + 1)).slice(-2),
          ("0" + new Date(task.date).getUTCDate()).slice(-2),
        ].join("-");

        return (
          <TaskCard
            key={task._id}
            task={task}
            onUpdateStatus={onUpdateStatus}
            onDelete={onDelete}
            isPast={taskDateStr < todayStr}
            isFuture={taskDateStr > todayStr}
          />
        );
      })}
    </div>
  );
}
