import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface GlassCardProps {
  title?: string;
  subtitle?: string;
  corner?: ReactNode;
  children: ReactNode;
  accentColor?: string;
  delay?: number;
  className?: string;
}

export function GlassCard({
  title,
  subtitle,
  corner,
  children,
  accentColor,
  delay = 0,
  className = "",
}: GlassCardProps) {
  return (
    <motion.section
      className={`relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5 text-slate-100 shadow-card backdrop-blur-xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      {/* Gradient top border accent */}
      {accentColor && (
        <div
          className="absolute left-0 right-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentColor}80, transparent)`,
          }}
        />
      )}

      {/* Inner glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background: "radial-gradient(ellipse at top left, rgba(255,255,255,0.03), transparent 60%)" }} />

      {(title || subtitle || corner) && (
        <header className="relative mb-4 flex items-start justify-between gap-3">
          <div>
            {title && (
              <p className="font-display text-base font-semibold tracking-tight text-white">{title}</p>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-white/40">{subtitle}</p>
            )}
          </div>
          {corner}
        </header>
      )}
      <div className="relative">{children}</div>
    </motion.section>
  );
}
