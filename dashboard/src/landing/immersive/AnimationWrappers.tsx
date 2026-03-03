/**
 * FlowPulse — Reusable Animation Wrappers
 * ────────────────────────────────────────
 * ScrollReveal, ParallaxLayer, GlassPanel, TiltCard
 */
import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView } from "framer-motion";
import { EASE_SMOOTH, HOVER, GLASS, GPU_STYLE, isMobile, prefersReducedMotion } from "./motionConfig";

// ─── ScrollReveal ─────────────────────────────────────────────
interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "scale";
    distance?: number;
    duration?: number;
    once?: boolean;
    amount?: number;
    style?: React.CSSProperties;
}

export function ScrollReveal({
    children, className = "", delay = 0, direction = "up",
    distance = 40, duration = 0.9, once = true, amount = 0.25, style,
}: ScrollRevealProps) {
    const initial: Record<string, number> = { opacity: 0 };
    const animate: Record<string, number> = { opacity: 1 };

    switch (direction) {
        case "up": initial.y = distance; animate.y = 0; break;
        case "down": initial.y = -distance; animate.y = 0; break;
        case "left": initial.x = distance; animate.x = 0; break;
        case "right": initial.x = -distance; animate.x = 0; break;
        case "scale": initial.scale = 0.88; animate.scale = 1; break;
    }

    return (
        <motion.div
            className={className}
            style={{ ...GPU_STYLE, ...style }}
            initial={initial}
            whileInView={animate}
            viewport={{ once, amount }}
            transition={{ delay, duration, ease: EASE_SMOOTH as unknown as number[] }}
        >
            {children}
        </motion.div>
    );
}

// ─── ParallaxLayer ────────────────────────────────────────────
interface ParallaxLayerProps {
    children: ReactNode;
    speed?: number;          // 0 = static, 1 = full scroll speed
    className?: string;
    style?: React.CSSProperties;
}

export function ParallaxLayer({ children, speed = 0.3, className = "", style }: ParallaxLayerProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });
    const yRange = 100 * speed;
    const y = useTransform(scrollYProgress, [0, 1], [`${yRange}px`, `-${yRange}px`]);

    if (isMobile() || prefersReducedMotion()) {
        return <div ref={ref} className={className} style={style}>{children}</div>;
    }

    return (
        <div ref={ref} className={`relative ${className}`} style={style}>
            <motion.div style={{ y, ...GPU_STYLE }}>
                {children}
            </motion.div>
        </div>
    );
}

// ─── MouseParallax ────────────────────────────────────────────
interface MouseParallaxProps {
    children: ReactNode;
    intensity?: number;   // 1–40px
    className?: string;
    style?: React.CSSProperties;
}

export function MouseParallax({ children, intensity = 16, className = "", style }: MouseParallaxProps) {
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const x = useSpring(rawX, { stiffness: 35, damping: 20 });
    const y = useSpring(rawY, { stiffness: 35, damping: 20 });

    const onMove = useCallback((e: React.MouseEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const cx = e.clientX - rect.left - rect.width / 2;
        const cy = e.clientY - rect.top - rect.height / 2;
        rawX.set((cx / rect.width) * intensity);
        rawY.set((cy / rect.height) * intensity);
    }, [rawX, rawY, intensity]);

    const onLeave = useCallback(() => { rawX.set(0); rawY.set(0); }, [rawX, rawY]);

    if (isMobile()) return <div className={className} style={style}>{children}</div>;

    return (
        <div className={className} style={style} onMouseMove={onMove} onMouseLeave={onLeave}>
            <motion.div style={{ x, y, ...GPU_STYLE }}>
                {children}
            </motion.div>
        </div>
    );
}

// ─── GlassPanel ───────────────────────────────────────────────
interface GlassPanelProps {
    children: ReactNode;
    className?: string;
    intensity?: "light" | "medium" | "strong";
    style?: React.CSSProperties;
}

export function GlassPanel({ children, className = "", intensity = "medium", style }: GlassPanelProps) {
    const blurValues = { light: 6, medium: GLASS.blur, strong: 16 };
    const opValues = { light: 0.6, medium: GLASS.opacity, strong: 0.92 };

    return (
        <div
            className={`rounded-2xl overflow-hidden ${className}`}
            style={{
                background: `rgba(5,37,88,${opValues[intensity]})`,
                border: GLASS.border,
                backdropFilter: `blur(${blurValues[intensity]}px)`,
                WebkitBackdropFilter: `blur(${blurValues[intensity]}px)`,
                ...style,
            }}
        >
            {children}
        </div>
    );
}

// ─── TiltCard ─────────────────────────────────────────────────
interface TiltCardProps {
    children: ReactNode;
    className?: string;
    maxTilt?: number;
    style?: React.CSSProperties;
}

export function TiltCard({ children, className = "", maxTilt = HOVER.tiltMaxDeg, style }: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState("perspective(800px) rotateX(0deg) rotateY(0deg)");
    const [shadow, setShadow] = useState(`0 4px 20px rgba(82,127,176,0.08)`);

    const handleMove = useCallback((e: React.MouseEvent) => {
        if (!ref.current || isMobile()) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setTransform(
            `perspective(800px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg) scale(${HOVER.softScale})`
        );
        setShadow(HOVER.shadowSpread);
    }, [maxTilt]);

    const handleLeave = useCallback(() => {
        setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)");
        setShadow(`0 4px 20px rgba(82,127,176,0.08)`);
    }, []);

    return (
        <div
            ref={ref}
            className={className}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            style={{
                transform,
                boxShadow: shadow,
                transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease",
                ...GPU_STYLE,
                ...style,
            }}
        >
            {children}
        </div>
    );
}

// ─── StaggerChildren (wrapper for staggered reveals) ──────────
interface StaggerChildrenProps {
    children: ReactNode;
    className?: string;
    stagger?: number;
    style?: React.CSSProperties;
}

export function StaggerChildren({ children, className = "", stagger = 0.08, style }: StaggerChildrenProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    return (
        <motion.div
            ref={ref}
            className={className}
            style={style}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
                hidden: {},
                visible: { transition: { staggerChildren: stagger } },
            }}
        >
            {children}
        </motion.div>
    );
}

// ─── StaggerItem ──────────────────────────────────────────────
export function StaggerItem({ children, className = "", style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
    return (
        <motion.div
            className={className}
            style={{ ...GPU_STYLE, ...style }}
            variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_SMOOTH as unknown as number[] } },
            }}
        >
            {children}
        </motion.div>
    );
}
