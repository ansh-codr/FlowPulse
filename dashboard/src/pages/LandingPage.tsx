import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Activity, BarChart2, Crosshair, Settings, CheckCircle2, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { MeshDistortMaterial, Float, Stars, Environment } from "@react-three/drei";

function Hero3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-80" style={{ height: "120vh" }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} color="#ff0055" intensity={0.5} />

        <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2}>
          <mesh position={[2, 0, -2]}>
            <sphereGeometry args={[2, 64, 64]} />
            <MeshDistortMaterial
              color="#0055FF"
              envMapIntensity={1}
              clearcoat={1}
              clearcoatRoughness={0.1}
              metalness={0.8}
              roughness={0.2}
              distort={0.4}
              speed={1.5}
            />
          </mesh>
        </Float>

        <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
          <mesh position={[-3, 1, -4]}>
            <sphereGeometry args={[1.5, 32, 32]} />
            <MeshDistortMaterial
              color="#ff00cc"
              envMapIntensity={1}
              clearcoat={1}
              clearcoatRoughness={0.2}
              metalness={0.7}
              roughness={0.2}
              distort={0.3}
              speed={2}
              wireframe={true}
            />
          </mesh>
        </Float>

        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
      {/* Dark gradient overlay to blend 3D with background smoothly */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0D0D10]/50 to-[#0D0D10] pointer-events-none" />
    </div>
  );
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax Values
  const yHeroText = useTransform(scrollYProgress, [0, 0.2], [0, 200]);
  const opacityHeroText = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const scaleDemo = useTransform(scrollYProgress, [0, 0.3], [1.05, 1]);
  const yDemo = useTransform(scrollYProgress, [0, 0.3], [100, 0]);
  const rotateXDemo = useTransform(scrollYProgress, [0, 0.3], [15, 0]);

  // Motion Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0D0D10] text-slate-200 font-sans overflow-x-hidden selection:bg-[#0055FF] selection:text-white">

      {/* 3D Background */}
      <Hero3D />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.05] bg-[#0D0D10]/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#0055FF]" />
            <span className="font-bold tracking-tight text-white">FlowPulse</span>
          </div>
          <div className="hidden md:flex flex-1 justify-center items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Platform</a>
            <a href="#demo" className="hover:text-white transition-colors">Analytics</a>
            <a href="#community" className="hover:text-white transition-colors">Developers</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors">Log In</Link>
            <Link to="/dashboard" className="px-5 py-2 rounded-full border border-[#0055FF]/40 bg-[#0055FF]/10 hover:bg-[#0055FF]/20 text-white text-sm font-medium transition-all shadow-[0_0_20px_rgba(0,85,255,0.1)] backdrop-blur-md flex shadow-[inset_0_0_10px_rgba(0,85,255,0.2)]">
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-32">
        {/* Animated Hero Section */}
        <section className="relative px-6 max-w-7xl mx-auto flex flex-col items-center text-center min-h-[70vh] justify-center">
          <motion.div style={{ y: yHeroText, opacity: opacityHeroText }} className="flex flex-col items-center">

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-400 mb-8 backdrop-blur-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#0055FF] animate-pulse shadow-[0_0_10px_#0055FF]" />
              FLOW STATE ACHIEVED
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-6 leading-[1.1] max-w-5xl"
            >
              Engineer your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-600">Cognitive Focus.</span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-lg md:text-2xl text-slate-400 mb-10 max-w-2xl font-light"
            >
              Analyze context shifts, visualize deep work blocks in real-time. The ultimate command center for modern builders.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Link to="/dashboard" className="group flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-slate-200 transition-all text-lg shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                Start Tracking
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* 3D App Preview Mockup / Parallax Container */}
        <section id="demo" className="relative px-6 pb-40 max-w-[1400px] mx-auto mt-[-10vh]" style={{ perspective: "2000px" }}>

          {/* Glassmorphic glow behind the mockup */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#0055FF]/20 rounded-[100px] blur-[120px] pointer-events-none -z-10" />

          <motion.div
            style={{
              scale: scaleDemo,
              y: yDemo,
              rotateX: rotateXDemo,
              transformStyle: "preserve-3d"
            }}
            className="rounded-3xl border border-white/[0.08] bg-[#0A0A0C]/80 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row h-[700px] relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none"
          >

            {/* Left Sidebar */}
            <div className="w-16 border-r border-white/5 flex flex-col items-center py-6 gap-6 bg-black/40 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#0055FF]/20 border border-[#0055FF]/30 text-[#0055FF] flex items-center justify-center cursor-pointer hover:bg-[#0055FF]/40 transition-colors shadow-[0_0_15px_rgba(0,85,255,0.2)]">
                <Activity className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-xl text-slate-500 flex items-center justify-center hover:text-white hover:bg-white/5 cursor-pointer transition-colors">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-xl text-slate-500 flex items-center justify-center hover:text-white hover:bg-white/5 cursor-pointer transition-colors">
                <Crosshair className="w-5 h-5" />
              </div>
              <div className="mt-auto w-10 h-10 rounded-xl text-slate-500 flex items-center justify-center hover:text-white hover:bg-white/5 cursor-pointer transition-colors">
                <Settings className="w-5 h-5" />
              </div>
            </div>

            {/* Central Workspace */}
            <div className="flex-1 p-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0C]/80 via-transparent to-[#0055FF]/5 pointer-events-none" />

              <div className="max-w-2xl relative z-10">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className="flex items-center justify-between mb-10"
                >
                  <div>
                    <h3 className="text-white text-2xl font-semibold tracking-tight">Timeline Altitude</h3>
                    <p className="text-sm text-slate-400 font-mono mt-2 tracking-widest uppercase">Live Trajectory // 0X-8F</p>
                  </div>
                  <div className="px-4 py-2 rounded-full border border-[#0055FF]/30 bg-[#0055FF]/10 backdrop-blur text-xs text-[#0055FF] font-bold shadow-[inset_0_0_10px_rgba(0,85,255,0.2)]">
                    <span className="inline-block w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
                    CAPTURING
                  </div>
                </motion.div>

                {/* Staggered Swatches */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className="space-y-4"
                >
                  {[
                    { range: "09:00 - 11:30", label: "DEEP WORK", score: 98, color: "from-[#0055FF] to-cyan-400" },
                    { range: "11:30 - 12:15", label: "CONTEXT SWITCH", score: 45, color: "from-orange-500 to-red-500" },
                    { range: "13:00 - 15:00", label: "SUSTAINED", score: 85, color: "from-[#0055FF] to-indigo-500" },
                    { range: "15:00 - 16:30", label: "SHALLOW", score: 60, color: "from-slate-600 to-slate-400" }
                  ].map((block, i) => (
                    <motion.div
                      key={i}
                      variants={fadeUp}
                      className="group relative flex items-center p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all cursor-pointer backdrop-blur-md"
                    >
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${block.color} flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform`}>
                        <span className="text-white font-bold text-base drop-shadow-md">{block.score}%</span>
                      </div>
                      <div className="ml-5 flex-1">
                        <p className="text-white font-semibold text-lg">{block.label}</p>
                        <p className="text-sm text-slate-500 font-mono mt-1">{block.range}</p>
                      </div>
                      <div className="flex-1 max-w-[250px] h-3 bg-black/50 rounded-full overflow-hidden hidden sm:block border border-white/5">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${block.color} shadow-[0_0_10px_currentColor]`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${block.score}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Right Properties Panel (Glassmorphism) */}
            <div className="w-96 border-l border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent backdrop-blur-3xl p-8 hidden lg:block relative z-10 shadow-[-20px_0_40px_rgba(0,0,0,0.5)]">
              <h4 className="text-xs font-mono text-slate-500 mb-8 tracking-[0.2em] border-b border-white/5 pb-4">PROPERTIES PANEL</h4>

              <div className="space-y-8">
                {/* Metric 1 */}
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-slate-400">Peak Resonance</span>
                    <span className="text-white font-mono font-medium">142m</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/50 overflow-hidden rounded-full border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "85%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-[#0055FF] rounded-full shadow-[0_0_15px_#0055FF]"
                    />
                  </div>
                </div>

                {/* Metric 2 */}
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-slate-400">Distraction Rate</span>
                    <span className="text-white font-mono font-medium">2.4/hr</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/50 overflow-hidden rounded-full border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "15%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-red-500 rounded-full"
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <p className="text-xs text-slate-500 mb-4 uppercase tracking-[0.1em]">Detected Contexts</p>
                  <div className="flex flex-wrap gap-2">
                    {['IDE', 'Browser', 'Figma', 'Terminal'].map(tag => (
                      <span key={tag} className="px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/10 text-xs text-slate-300 font-medium hover:bg-white/10 transition-colors cursor-pointer">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <button className="w-full py-3 flex justify-center items-center rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 border border-white/10 text-sm font-semibold text-white transition-all hover:border-[#0055FF]/50 hover:shadow-[0_0_20px_rgba(0,85,255,0.2)]">
                    Generate Export Log
                  </button>
                </div>
              </div>
            </div>

          </motion.div>
        </section>

        {/* Feature Sections */}
        <section id="features" className="py-32 px-6 max-w-7xl mx-auto border-t border-white/5 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-20 items-center"
          >
            <div>
              <div className="text-sm font-mono text-[#0055FF] mb-6 tracking-[0.3em] font-medium">01 // NEURO-TRACKING</div>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter leading-tight">Visualize your<br />cognitive altitude.</h2>
              <p className="text-slate-400 text-xl mb-10 leading-relaxed font-light">
                Stop guessing when you're most productive. FlowPulse maps out your daily focus waves, pinpointing exactly when you hit flow state and what drags you down.
              </p>
              <ul className="space-y-5 mb-10">
                {['Automatic distraction logging', 'Real-time deep work score validation', 'Intelligent context switch penalties'].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + (i * 0.1), duration: 0.5 }}
                    className="flex items-center gap-4 text-slate-300 text-lg"
                  >
                    <CheckCircle2 className="w-6 h-6 text-[#0055FF] flex-shrink-0" />
                    {item}
                  </motion.li>
                ))}
              </ul>
              <Link to="/dashboard" className="inline-flex items-center gap-2 group text-[#0055FF] font-semibold text-lg hover:text-white transition-colors">
                Explore Analytics <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

            {/* 3D Visual Element container */}
            <div className="relative perspective-[1000px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#0055FF]/10 blur-[100px] rounded-full pointer-events-none -z-10" />

              <motion.div
                whileHover={{ rotateY: 5, rotateX: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative aspect-square rounded-[3rem] border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-[1px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform-style-3d"
              >
                <div className="w-full h-full rounded-[3rem] bg-[#0A0A0C] border border-white/5 flex flex-col justify-center p-12 overflow-hidden relative">

                  {/* Abstract graph lines */}
                  <div className="w-full space-y-6 z-10">
                    {[40, 70, 100, 85, 30].map((h, i) => (
                      <div key={i} className="w-full h-10 bg-black/40 text-xs sm:text-sm rounded-xl overflow-hidden flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors border border-white/5">
                        <motion.div
                          className="h-full bg-gradient-to-r from-[#0055FF] to-cyan-400 flex items-center pl-4 transition-all"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                          style={{ opacity: 0.6 + (i * 0.1) }}
                        >
                          <span className="text-white font-mono font-medium mix-blend-overlay">T_BLOCK_{i + 1}</span>
                        </motion.div>
                        <span className="mr-5 text-white/50 group-hover:text-white transition-colors font-mono">{h}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none mix-blend-overlay" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-16 px-6 bg-black relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-[#0055FF]" />
            <span className="font-bold text-xl tracking-tight text-white">FlowPulse</span>
            <span className="px-2 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-slate-400 font-mono ml-2">PRO_v1.0</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
          </div>
          <p className="text-sm text-slate-600 font-medium">© 2026 FlowPulse. Engineered for Focus.</p>
        </div>
      </footer>
    </div>
  );
}
