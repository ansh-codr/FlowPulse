import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float, Environment, Lightformer } from "@react-three/drei";
import { motion } from "framer-motion";

function SwirlingOrb() {
  const meshRef = useRef<any>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <Float floatIntensity={1} rotationIntensity={1} speed={2}>
      {/* Outer Glass Orb */}
      <mesh ref={meshRef} position={[0, 0, 0]} scale={2.8}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={2}
          chromaticAberration={0.05}
          anisotropy={1}
          distortion={0.5}
          distortionScale={0.5}
          temporalDistortion={0.1}
          clearcoat={1}
          attenuationDistance={0.5}
          attenuationColor="#ffffff"
          color="#a0a0b0"
        />
      </mesh>

      {/* Inner Core */}
      <mesh scale={2.0}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="#1a1c23" roughness={0.6} metalness={0.8} />
      </mesh>
    </Float>
  );
}

function Hero3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} intensity={2} angle={0.15} penumbra={1} />
        <spotLight position={[-10, -10, -10]} intensity={1} color="#0055ff" />

        <SwirlingOrb />

        <Environment resolution={256}>
          {/* Custom reflections to make the glass material look good */}
          <group rotation={[-Math.PI / 3, 0, 0]}>
            <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} color="#ffffff" />
            <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} color="#0055ff" />
            <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[5, 1, -1]} scale={2} color="#ffffff" />
            <Lightformer form="circle" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} color="#0055ff" />
          </group>
        </Environment>
      </Canvas>
    </div>
  );
}

const MountainSilhouette = () => (
  <svg
    preserveAspectRatio="none"
    viewBox="0 0 1440 320"
    className="absolute bottom-0 w-full h-[40vh] z-0 fill-[#0b0c10] pointer-events-none opacity-80"
  >
    <path d="M0,224L48,208C96,192,192,160,288,149.3C384,139,480,149,576,144C672,139,768,117,864,133.3C960,149,1056,203,1152,229.3C1248,256,1344,256,1392,256L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
    <path d="M0,288L60,266.7C120,245,240,203,360,170.7C480,139,600,117,720,128C840,139,960,181,1080,213.3C1200,245,1320,267,1380,277.3L1440,288L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" opacity="0.6" />
    <path d="M0,160L80,176C160,192,320,224,480,213.3C640,203,800,149,960,144C1120,139,1280,181,1360,202.7L1440,224L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" opacity="0.3" />
  </svg>
);

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  return (
    <div
      className="relative min-h-screen bg-[#14151a] overflow-hidden selection:bg-white/20 selection:text-white flex flex-col justify-between"
      onMouseMove={handleMouseMove}
    >
      {/* Soft Blue Edge Glow */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_20px_rgba(0,85,255,0.15)] z-20" />

      {/* 3D Background */}
      <Hero3D />

      {/* Mountain silhouettes */}
      <MountainSilhouette />

      {/* Floating Center Letters Layout */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <motion.div
          animate={{ x: -mousePos.x, y: -mousePos.y }}
          transition={{ type: "spring", stiffness: 100, damping: 30 }}
          className="relative w-[300px] h-[300px] text-white/70 font-mono tracking-widest text-xs font-semibold uppercase"
        >
          <span className="absolute top-[10%] left-[45%]">F</span>
          <span className="absolute top-[20%] right-[20%]">L</span>
          <span className="absolute top-[40%] right-[10%]">O</span>
          <span className="absolute top-[65%] right-[20%]">W</span>
          <span className="absolute top-[85%] left-[45%]">P</span>
          <span className="absolute top-[65%] left-[20%]">U</span>
          <span className="absolute top-[40%] left-[10%]">L</span>
          <span className="absolute top-[20%] left-[20%]">S</span>
          <span className="absolute top-[45%] left-[46%] text-[#0055ff] font-bold text-xl">E</span>

          {/* White Dot indicator on orbit */}
          <div className="absolute top-[80%] right-[10%] w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]" />
        </motion.div>
      </div>

      {/* UI Overlay - Top Nav */}
      <header className="relative z-30 flex justify-between items-center px-12 py-8">
        <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors">
          <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
        </div>

        <div className="flex gap-4">
          <Link to="/login" className="px-6 py-2.5 rounded-full border border-white/20 text-xs tracking-widest text-white/80 hover:text-white hover:bg-white/5 transition-colors font-mono">
            LOG IN
          </Link>
          <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 hover:bg-white/5 transition-colors">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
        </div>
      </header>

      {/* UI Overlay - Bottom Content */}
      <main className="relative z-30 px-12 md:px-24 pb-16 flex justify-between items-end w-full flex-1">
        <div className="max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl md:text-7xl font-semibold text-white leading-[1.1] mb-6"
          >
            Deep Work
            <br />
            Command Center.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-xl text-white/50 font-light mb-12 leading-relaxed"
          >
            Track context switches, map out your focus layers, and sustain peak performance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex items-center gap-4"
          >
            <Link to="/dashboard" className="px-8 py-3.5 rounded-full border border-white/20 text-xs tracking-[0.2em] font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all font-mono">
              OPEN APP
            </Link>
            <button className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all group">
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="translate-x-0.5 text-white/80 group-hover:text-white transition-colors">
                <path d="M11 7L1 12.7735L1 1.2265L11 7Z" fill="currentColor" />
              </svg>
            </button>
          </motion.div>
        </div>

        {/* Bottom Right Equalizer Icon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="hidden md:flex w-12 h-12 rounded-full border border-white/20 items-center justify-center hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="flex items-end gap-[2px] h-3 opacity-50">
            <div className="w-[1px] bg-white h-2" />
            <div className="w-[1px] bg-white h-3" />
            <div className="w-[1px] bg-white h-1.5" />
            <div className="w-[1px] bg-white h-2.5" />
            <div className="w-[1px] bg-white h-1.5" />
          </div>
        </motion.div>
      </main>

    </div>
  );
}
