import Link from "next/link";
import { ArrowRight, Calendar, BarChart3, CheckSquare, Zap, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Premium Background Mesh Gradient Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-fuchsia-400/10 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <header className="relative z-10 w-full backdrop-blur-md bg-white/60 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600">
              DailySync
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
            <Link 
              href="/signup" 
              className="text-sm font-bold bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold mb-8 shadow-sm">
            <Zap className="w-4 h-4" />
            <span>Master your habits with precision timezone logic</span>
          </div>
          
          <h1 className="text-6xl sm:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-8">
            Sync your life. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600">
              Own your time.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed font-medium">
            The premium task manager and routine tracker built to eliminate timezone 
            drift. Infinite dynamic calendars and crystal clear analytics, perfectly matched to your local week.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-lg font-bold bg-indigo-600 text-white px-8 py-4 rounded-full hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200/50 hover:shadow-indigo-300 hover:-translate-y-1"
            >
              Start Tracking Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto flex items-center justify-center text-lg font-bold bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-full hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
            >
              Log into Account
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/70 backdrop-blur-xl border border-gray-200/60 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Flawless Timezones</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              No more UTC midnight drift. Your tasks snap perfectly to your local Indian Standard Time (IST) calendar dates forever.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-gray-200/60 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Infinite Routines</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              Set it and forget it. Define a routine once and watch the dynamic window infinitely lazy-generate tasks as you scroll through the calendar.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-gray-200/60 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="w-14 h-14 bg-fuchsia-50 text-fuchsia-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">True Analytics</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              Crystal-clear bar charts exactly bounded to your Monday-Sunday week. Track completion percentage and calculate your consecutive day streak.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
