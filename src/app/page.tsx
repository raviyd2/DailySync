import Link from "next/link";
import { ArrowRight, Calendar, BarChart3, CheckSquare, Zap, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-indigo-500/30" suppressHydrationWarning>
      {/* Premium Background Mesh Gradient Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/25 blur-[120px] pointer-events-none animate-pulse duration-[10s]" />
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-400/25 blur-[120px] pointer-events-none animate-pulse duration-[8s]" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-fuchsia-400/15 blur-[120px] pointer-events-none animate-pulse duration-[12s]" />

      {/* Navbar */}
      <header className="relative z-50 w-full backdrop-blur-xl bg-white/70 border-b border-gray-200/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo Container */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200/50">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600">
              DailySync
            </span>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link 
              href="/login" 
              className="hidden sm:block text-sm font-bold text-gray-700 hover:text-indigo-600 transition-colors"
            >
              Sign in
            </Link>
            <Link 
              href="/signup" 
              className="text-[13px] sm:text-sm font-black bg-gray-900 text-white px-4 sm:px-6 py-2.5 rounded-full hover:bg-indigo-600 transition-all shadow-md hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5 whitespace-nowrap"
            >
              <span className="sm:hidden">Get Started</span>
              <span className="hidden sm:inline">Get Started Free</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-24 pb-20 sm:pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-indigo-100 text-indigo-700 text-[11px] sm:text-sm font-bold mb-6 sm:mb-8 shadow-sm">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 animate-bounce" />
            <span className="tracking-wide uppercase">Precision Timezone Logic</span>
          </div>
          
          <h1 className="text-5xl sm:text-8xl font-black text-gray-900 tracking-tighter leading-[1] mb-6 sm:mb-8">
            Sync your life. <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600">
              Own your time.
            </span>
          </h1>
          
          <p className="text-base sm:text-xl text-gray-500 mb-10 leading-relaxed font-medium max-w-2xl mx-auto px-2">
            The premium task manager built to eliminate <span className="text-gray-900 font-bold">timezone drift</span>. 
            Infinite dynamic calendars and crystal clear analytics, perfectly matched to your week.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 sm:px-0">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-lg font-bold bg-indigo-600 text-white px-8 py-4 rounded-2xl sm:rounded-full hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200/50 hover:shadow-indigo-300 hover:-translate-y-1"
            >
              Start Tracking Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto flex items-center justify-center text-lg font-bold bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-2xl sm:rounded-full hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
            >
              Log into Account
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 sm:mt-40 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Flawless Timezones</h3>
            <p className="text-gray-500 font-medium leading-relaxed text-sm sm:text-base">
              No more UTC midnight drift. Your tasks snap perfectly to your local Indian Standard Time (IST) calendar dates forever.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group">
            <div className="w-14 h-14 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-violet-600 group-hover:text-white transition-all duration-500">
              <CheckSquare className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Infinite Routines</h3>
            <p className="text-gray-500 font-medium leading-relaxed text-sm sm:text-base">
              Set it and forget it. Define a routine once and watch the dynamic window infinitely lazy-generate tasks as you scroll.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group">
            <div className="w-14 h-14 bg-fuchsia-50 text-fuchsia-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-fuchsia-600 group-hover:text-white transition-all duration-500">
              <BarChart3 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">True Analytics</h3>
            <p className="text-gray-500 font-medium leading-relaxed text-sm sm:text-base">
              Crystal-clear bar charts exactly bounded to your Monday-Sunday week. Track completion % and calculate streaks.
            </p>
          </div>
        </div>
      </main>

      {/* Premium Footer */}
      <footer className="relative z-10 border-t border-gray-200/50 bg-white/30 backdrop-blur-md pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-black text-gray-900">DailySync</span>
              <span className="text-xs text-gray-400 font-medium ml-2">© 2026. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors">Terms of Service</Link>
              <Link href="#" className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
