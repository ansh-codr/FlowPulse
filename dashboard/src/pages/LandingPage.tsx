import { Link } from "react-router-dom";
import { ArrowRight, Activity, BarChart2, Crosshair, Settings, CheckCircle2, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D0D10] text-slate-200 font-sans overflow-x-hidden selection:bg-[#0055FF] selection:text-white pb-32">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.05] bg-[#0D0D10]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#0055FF]" />
            <span className="font-bold tracking-tight text-white">FlowPulse</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-white transition-colors">Dashboard</a>
            <a href="#analytics" className="hover:text-white transition-colors">Analytics</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Log In</Link>
            <Link to="/dashboard" className="px-4 py-2 rounded-full bg-[#0055FF] hover:bg-[#0044CC] text-white text-sm font-medium transition-all shadow-[0_0_20px_rgba(0,85,255,0.3)]">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Abstract Glowing Orb effect (Flareum style) */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#0055FF] rounded-full blur-[150px] opacity-20 pointer-events-none -z-10" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-400 mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[#0055FF] animate-pulse" />
          SYSTEM OPTIMIZED
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 leading-tight max-w-4xl">
          The command center for <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">deep cognitive work.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl font-light">
          Track context switches, map out your focus layers, and sustain peak performance with our ultra-precise analytics engine.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link to="/dashboard" className="group flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-slate-200 transition-all">
            Open App
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#demo" className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all backdrop-blur-sm">
            View Analytics
          </a>
        </div>
      </section>

      {/* Flareum-style Interactive App UI Mockup */}
      <section id="demo" className="relative px-6 pb-32 max-w-[1400px] mx-auto">
        <div className="rounded-2xl border border-white/10 bg-[#0A0A0C] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row h-[600px]">
          
          {/* Left Sidebar */}
          <div className="w-16 border-r border-white/5 flex flex-col items-center py-6 gap-6 bg-white/[0.02]">
            <div className="w-8 h-8 rounded-lg bg-[#0055FF]/20 text-[#0055FF] flex items-center justify-center cursor-pointer hover:bg-[#0055FF]/40 transition-colors">
              <Activity className="w-4 h-4" />
            </div>
            <div className="w-8 h-8 rounded-lg text-slate-500 flex items-center justify-center hover:text-white cursor-pointer transition-colors">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div className="w-8 h-8 rounded-lg text-slate-500 flex items-center justify-center hover:text-white cursor-pointer transition-colors">
              <Crosshair className="w-4 h-4" />
            </div>
            <div className="mt-auto w-8 h-8 rounded-lg text-slate-500 flex items-center justify-center hover:text-white cursor-pointer transition-colors">
              <Settings className="w-4 h-4" />
            </div>
          </div>

          {/* Central Workspace */}
          <div className="flex-1 p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat relative">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0C] via-transparent to-[#0A0A0C] pointer-events-none" />
            <div className="max-w-2xl relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-white text-lg font-medium">Focus Architect</h3>
                  <p className="text-sm text-slate-500 font-mono mt-1">SESSIONS // DAILY</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                  <span className="text-[#0055FF] font-bold">LIVE</span> TRACKING
                </div>
              </div>

              {/* Stack of Swatches / Data Blocks */}
              <div className="space-y-4">
                {[
                  { range: "09:00 - 11:30", label: "DEEP WORK", score: 98, color: "from-[#0055FF] to-cyan-400" },
                  { range: "11:30 - 12:15", label: "CONTEXT SWITCH", score: 45, color: "from-orange-500 to-red-500" },
                  { range: "13:00 - 15:00", label: "SUSTAINED", score: 85, color: "from-[#0055FF] to-indigo-500" },
                  { range: "15:00 - 16:30", label: "SHALLOW", score: 60, color: "from-slate-600 to-slate-400" }
                ].map((block, i) => (
                  <div key={i} className="group relative flex items-center p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${block.color} flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform`}>
                      <span className="text-white font-bold text-sm drop-shadow-md">{block.score}%</span>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-white font-medium">{block.label}</p>
                      <p className="text-xs text-slate-500 font-mono mt-1">{block.range}</p>
                    </div>
                    <div className="flex-1 max-w-[200px] h-2 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                      <div className={`h-full bg-gradient-to-r ${block.color} shadow-[0_0_10px_currentColor]`} style={{ width: `${block.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Properties Panel (Glassmorphism) */}
          <div className="w-80 border-l border-white/5 bg-white/[0.01] backdrop-blur-xl p-6 hidden lg:block">
            <h4 className="text-xs font-mono text-slate-500 mb-6">PROPERTIES PANEL</h4>
            
            <div className="space-y-6">
              {/* Metric 1 */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Peak Resonance</span>
                  <span className="text-white font-mono">142m</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full">
                  <div className="h-full bg-[#0055FF] rounded-full w-[85%] shadow-[0_0_10px_#0055FF]" />
                </div>
              </div>

              {/* Metric 2 */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Distraction Rate</span>
                  <span className="text-white font-mono">2.4/hr</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full">
                  <div className="h-full bg-red-500 rounded-full w-[15%]" />
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Session Tags</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-slate-300">coding</span>
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-slate-300">design</span>
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-slate-300">architecture</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <button className="w-full py-2 flex justify-center items-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors">
                  Export Metrics
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Modern Feature Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-sm font-mono text-[#0055FF] mb-4 tracking-widest">01 // NEURO-TRACKING</div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Visualize your cognitive altitude.</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Stop guessing when you're most productive. FlowPulse maps out your daily focus waves, pinpointing exactly when you hit flow state and what pulls you out of it.
            </p>
            <ul className="space-y-4 mb-8">
              {['Automatic distraction logging', 'Deep work score calculation', 'Context switch penalties'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-[#0055FF]" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/dashboard" className="inline-flex items-center gap-2 group text-[#0055FF] font-medium hover:text-white transition-colors">
              Explore Analytics <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="relative">
            {/* Glowing Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#0055FF]/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative aspect-square md:aspect-[4/3] rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-1">
              <div className="w-full h-full rounded-xl bg-[#0A0A0C] border border-white/5 flex items-center justify-center p-8 overflow-hidden relative">
                
                {/* Abstract graphical representation */}
                <div className="w-full space-y-4 z-10">
                  {[40, 70, 100, 85, 60].map((h, i) => (
                    <div key={i} className="w-full h-8 bg-white/5 text-[10px] sm:text-xs rounded-full overflow-hidden flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-colors">
                      <div className="h-full bg-gradient-to-r from-[#0055FF] to-cyan-400 flex items-center pl-4 transition-all" style={{ width: `${h}%`, opacity: 0.5 + (i * 0.1) }}>
                         <span className="text-white font-mono mix-blend-overlay">BLOCK_0{i+1}</span>
                      </div>
                      <span className="mr-4 text-white/50 group-hover:text-white/80 transition-colors">{h}%</span>
                    </div>
                  ))}
                </div>
                
                {/* Background grid */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-[#0A0A0C]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#0055FF]" />
            <span className="font-bold text-white">FlowPulse</span>
            <span className="text-xs text-slate-500 font-mono ml-2">v.1.0</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 FlowPulse Analytics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
