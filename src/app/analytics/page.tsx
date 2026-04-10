"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { PieChart, TrendingUp, TrendingDown, Target, Flame, Calendar } from "lucide-react";
import toast from "react-hot-toast";

interface Task {
  _id: string;
  title: string;
  date: string;
  status: "pending" | "completed" | "missed";
}

type FilterPeriod = "week" | "month" | "all";

// IST-aware today YYYY-MM-DD
function getISTDateStr(date: Date): string {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const d = new Date(date.getTime() + IST_OFFSET_MS);
  return [
    d.getUTCFullYear(),
    ("0" + (d.getUTCMonth() + 1)).slice(-2),
    ("0" + d.getUTCDate()).slice(-2),
  ].join("-");
}

// Extract YYYY-MM-DD from stored UTC midnight task date
function getTaskDateStr(isoDate: string): string {
  const d = new Date(isoDate);
  return [
    d.getUTCFullYear(),
    ("0" + (d.getUTCMonth() + 1)).slice(-2),
    ("0" + d.getUTCDate()).slice(-2),
  ].join("-");
}

export default function Analytics() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<FilterPeriod>("week");

  // Fetch all historical tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`/api/tasks/get?all=true`);
        const data = await res.json();
        if (res.ok) setTasks(data.tasks);
      } catch {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const todayStr = getISTDateStr(new Date());

  // --- Filter tasks by period ---
  const filteredTasks = useMemo(() => {
    if (period === "all") return tasks;

    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const nowIST = new Date(Date.now() + IST_OFFSET_MS);
    const viewYear = nowIST.getUTCFullYear();
    const viewMonth = nowIST.getUTCMonth();
    const viewDate = nowIST.getUTCDate();
    
    let startStr = "";
    let endStr = "";

    if (period === "month") {
      const firstDay = new Date(Date.UTC(viewYear, viewMonth, 1));
      const lastDay = new Date(Date.UTC(viewYear, viewMonth + 1, 0));
      startStr = getISTDateStr(firstDay);
      endStr = getISTDateStr(lastDay);
    } else if (period === "week") {
      // Standard week: Monday to Sunday
      const dayOfWeek = nowIST.getUTCDay(); // 0 is Sunday
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(Date.UTC(viewYear, viewMonth, viewDate + diffToMonday));
      const sunday = new Date(Date.UTC(viewYear, viewMonth, viewDate + diffToMonday + 6));
      startStr = getISTDateStr(monday);
      endStr = getISTDateStr(sunday);
    }
    
    return tasks.filter((t) => {
      const tStr = getTaskDateStr(t.date);
      return tStr >= startStr && tStr <= endStr;
    });
  }, [tasks, period]);

  const totalTasks     = filteredTasks.length;
  const completedTasks = filteredTasks.filter((t) => t.status === "completed").length;
  const missedTasks    = filteredTasks.filter((t) => t.status === "missed").length;
  const pendingTasks   = filteredTasks.filter((t) => t.status === "pending").length;

  const completionPct = totalTasks > 0 ? +((completedTasks / totalTasks) * 100).toFixed(1) : 0;
  const missedPct     = totalTasks > 0 ? +((missedTasks    / totalTasks) * 100).toFixed(1) : 0;
  const pendingPct    = totalTasks > 0 ? +((pendingTasks   / totalTasks) * 100).toFixed(1) : 0;

  // --- This Week's bar chart data (Monday to Sunday) ---
  const last7Days = useMemo(() => {
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const nowIST = new Date(Date.now() + IST_OFFSET_MS);
    const viewYear = nowIST.getUTCFullYear();
    const viewMonth = nowIST.getUTCMonth();
    const viewDate = nowIST.getUTCDate();
    const dayOfWeek = nowIST.getUTCDay(); // 0 is Sunday
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.UTC(viewYear, viewMonth, viewDate + diffToMonday + i));
      const dateStr = getISTDateStr(d);
      const dayTasks = tasks.filter((t) => getTaskDateStr(t.date) === dateStr);
      days.push({
        // Keep it aligned by using UTC timezone forcing
        label: d.toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" }),
        dateStr,
        completed: dayTasks.filter((t) => t.status === "completed").length,
        missed:    dayTasks.filter((t) => t.status === "missed").length,
        pending:   dayTasks.filter((t) => t.status === "pending").length,
        total:     dayTasks.length,
      });
    }
    return days;
  }, [tasks]);

  const barMax = Math.max(...last7Days.map((d) => d.total), 1);

  // --- Streak: consecutive past days (up to today) with ≥1 completed task ---
  const streak = useMemo(() => {
    let count = 0;
    for (let i = 0; i <= 365; i++) {
      const dateStr = getISTDateStr(new Date(Date.now() - i * 86400000));
      if (dateStr > todayStr) continue; // skip future
      const dayCompleted = tasks.some(
        (t) => getTaskDateStr(t.date) === dateStr && t.status === "completed"
      );
      if (dayCompleted) {
        count++;
      } else if (dateStr < todayStr) {
        // Gap in the past — streak broken
        break;
      }
    }
    return count;
  }, [tasks, todayStr]);

  const TABS: { key: FilterPeriod; label: string }[] = [
    { key: "week",  label: "This Week"  },
    { key: "month", label: "This Month" },
    { key: "all",   label: "All Time"   },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">

          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <PieChart className="w-6 h-6 mr-2 text-indigo-600" /> Analytics
            </h1>

            {/* Period tabs */}
            <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setPeriod(tab.key)}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                    period === tab.key
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            /* Skeleton loader */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
                  <div className="h-10 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Top Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {/* Streak */}
                <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-orange-500 mb-2">
                    <Flame className="w-5 h-5" />
                    <span className="text-sm font-semibold">Streak</span>
                  </div>
                  <div className="text-4xl font-bold text-gray-900">{streak}</div>
                  <p className="text-xs text-gray-400 mt-1">consecutive days</p>
                </div>

                {/* Completion */}
                <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm font-semibold">Done</span>
                  </div>
                  <div className="text-4xl font-bold text-gray-900">{completionPct}%</div>
                  <p className="text-xs text-gray-400 mt-1">{completedTasks} of {totalTasks} tasks</p>
                </div>

                {/* Missed */}
                <div className="bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-red-500 mb-2">
                    <TrendingDown className="w-5 h-5" />
                    <span className="text-sm font-semibold">Missed</span>
                  </div>
                  <div className="text-4xl font-bold text-gray-900">{missedPct}%</div>
                  <p className="text-xs text-gray-400 mt-1">{missedTasks} of {totalTasks} tasks</p>
                </div>

                {/* Pending */}
                <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-indigo-500 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm font-semibold">Pending</span>
                  </div>
                  <div className="text-4xl font-bold text-gray-900">{pendingTasks}</div>
                  <p className="text-xs text-gray-400 mt-1">{pendingPct}% of total</p>
                </div>
              </div>

              {/* This Week Bar Chart */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
                <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-500" /> This Week's Activity
                </h2>

                {last7Days.every((d) => d.total === 0) ? (
                  <p className="text-center text-gray-400 py-8 text-sm">No task data for this week.</p>
                ) : (
                  <div className="flex items-end gap-2 h-32">
                    {last7Days.map((day) => {
                      const compH = barMax > 0 ? (day.completed / barMax) * 100 : 0;
                      const missH = barMax > 0 ? (day.missed    / barMax) * 100 : 0;
                      const pendH = barMax > 0 ? (day.pending   / barMax) * 100 : 0;
                      const isToday = day.dateStr === todayStr;
                      return (
                        <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-1">
                          {/* Stacked bar */}
                          <div className="w-full flex flex-col-reverse justify-start rounded-t-md overflow-hidden" style={{ height: "96px" }}>
                            {/* Completed — bottom */}
                            <div
                              className="w-full bg-green-400 transition-all duration-700"
                              style={{ height: `${compH}%` }}
                            />
                            {/* Missed */}
                            <div
                              className="w-full bg-red-400 transition-all duration-700"
                              style={{ height: `${missH}%` }}
                            />
                            {/* Pending — top */}
                            <div
                              className="w-full bg-indigo-300 transition-all duration-700"
                              style={{ height: `${pendH}%` }}
                            />
                          </div>
                          {/* Day label */}
                          <span className={`text-[10px] font-semibold ${isToday ? "text-indigo-600" : "text-gray-400"}`}>
                            {isToday ? "Today" : day.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-400 inline-block" /> Completed</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Missed</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-indigo-300 inline-block" /> Pending</span>
                </div>
              </div>

              {/* Distribution breakdown */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 mb-5">Task Distribution</h2>

                {totalTasks > 0 ? (
                  <div className="flex flex-col gap-4">
                    {[
                      { label: "Completed", pct: completionPct, color: "bg-green-500", count: completedTasks },
                      { label: "Pending",   pct: pendingPct,    color: "bg-yellow-400", count: pendingTasks  },
                      { label: "Missed",    pct: missedPct,     color: "bg-red-500",    count: missedTasks   },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium text-gray-700 shrink-0">{row.label}</div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
                            <div
                              className={`${row.color} h-5 rounded-full flex items-center justify-end px-2 transition-all duration-700 ease-out`}
                              style={{ width: `${Math.max(row.pct, row.pct > 0 ? 4 : 0)}%` }}
                            >
                              {row.pct > 8 && (
                                <span className="text-[10px] font-bold text-white">{row.pct}%</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="w-12 text-right text-sm font-semibold text-gray-600 shrink-0">{row.count}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-6 text-sm">No data for this period. Start creating tasks!</p>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
