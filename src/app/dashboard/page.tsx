"use client";

import { useEffect, useState } from "react";
import { useHasMounted } from "@/hooks/useHasMounted";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import TaskList from "@/components/TaskList";
import { ListTodo, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
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

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const hasMounted = useHasMounted();

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks/get");
      const data = await res.json();
      if (res.ok) {
        setTasks(data.tasks);
      }
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      const res = await fetch("/api/tasks/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status }),
      });
      if (res.ok) {
        toast.success("Task updated");
        fetchTasks();
      }
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      const res = await fetch(`/api/tasks/delete?taskId=${taskToDelete}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Task deleted");
        fetchTasks();
      }
    } catch (error) {
      toast.error("Failed to delete task");
    } finally {
      setTaskToDelete(null);
    }
  };

  // IST today — add 5h30m offset to UTC so midnight–5:30AM IST still shows the right date
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(Date.now() + IST_OFFSET_MS);
  const todayStr_dash = [
    nowIST.getUTCFullYear(),
    ("0" + (nowIST.getUTCMonth() + 1)).slice(-2),
    ("0" + nowIST.getUTCDate()).slice(-2),
  ].join("-");

  // Tasks are stored at UTC midnight = the IST calendar date, so compare UTC date components
  const todaysTasks = tasks.filter((t) => {
    const d = new Date(t.date);
    const taskDateStr = [
      d.getUTCFullYear(),
      ("0" + (d.getUTCMonth() + 1)).slice(-2),
      ("0" + d.getUTCDate()).slice(-2),
    ].join("-");
    return taskDateStr === todayStr_dash;
  });
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const missedTasks = tasks.filter((t) => t.status === "missed").length;

  if (!hasMounted) return null;

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      <Navbar />
      <main className="max-w-7xl mx-auto py-4 sm:py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-2 sm:py-6 sm:px-0">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 sm:mb-6">Dashboard</h1>
          
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-8">
                <StatsCard 
                  title="Total Tasks" 
                  value={totalTasks} 
                  icon={<ListTodo className="h-6 w-6 text-indigo-600" />} 
                />
                <StatsCard 
                  title="Completed Tasks" 
                  value={completedTasks} 
                  icon={<CheckCircle2 className="h-6 w-6 text-green-600" />} 
                />
                <StatsCard 
                  title="Missed Tasks" 
                  value={missedTasks} 
                  icon={<XCircle className="h-6 w-6 text-red-600" />} 
                />
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Today's Tasks</h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {new Date(todayStr_dash + "T12:00:00").toLocaleDateString("en-IN", {
                        weekday: "long", day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                  </div>
                  {todaysTasks.filter(t => t.status === "pending").length > 0 && (
                    <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
                      {todaysTasks.filter(t => t.status === "pending").length} pending
                    </span>
                  )}
                </div>
                <TaskList 
                  tasks={todaysTasks} 
                  onUpdateStatus={handleUpdateStatus} 
                  onDelete={(id) => setTaskToDelete(id)} 
                  todayStr={todayStr_dash}
                />
              </div>
            </>
          )}
        </div>
      </main>

      <ConfirmationModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task from your dashboard? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}
