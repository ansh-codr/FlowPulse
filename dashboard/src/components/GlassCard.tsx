import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface GlassCardProps {
  title?: string;
  subtitle?: string;
  corner?: ReactNode;
  children: ReactNode;
}

export function GlassCard({ title, subtitle, corner, children }: GlassCardProps) {
  return (
    <motion.section
      className="rounded-3xl border border-white/5 bg-white/5 p-5 text-slate-100 shadow-glow backdrop-blur-2xl"
      initial={{ opacity: 0, translateY: 24 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 0.5 }}
    >
      {(title || subtitle || corner) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          <div>
            {title && <p className="font-display text-lg tracking-tight text-white">{title}</p>}
            {subtitle && <p className="text-xs text-white/60">{subtitle}</p>}
          </div>
          {corner}
        </header>
      )}
      {children}
    </motion.section>
  );
}
