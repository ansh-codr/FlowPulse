import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// ── palette
const DEEP = "#011023";
const MID = "#052558";
const ACCENT = "#527FB0";
const LIGHT = "#7C9FC9";

interface Step {
    number: string;
    title: string;
    body: string;
}

const INSTALL_STEPS: Step[] = [
    {
        number: "01",
        title: "Download the extension",
        body: "Click the button above to download the FlowPulse.crx file. Save it anywhere on your computer.",
    },
    {
        number: "02",
        title: "Open your Chrome extensions page",
        body: 'Navigate to chrome://extensions in Chrome. You can also click the puzzle-piece icon → "Manage Extensions".',
    },
    {
        number: "03",
        title: "Drag and drop to install",
        body: "Drag the downloaded FlowPulse.crx file directly onto the chrome://extensions page. Chrome will prompt you to confirm — click Add Extension.",
    },
    {
        number: "04",
        title: "Pin it",
        body: "Click the puzzle piece icon in the toolbar and pin FlowPulse so it stays visible.",
    },
];

const FALLBACK_STEPS: Step[] = [
    {
        number: "01",
        title: "Enable Developer Mode",
        body: 'Go to chrome://extensions and toggle on "Developer mode" in the top-right corner.',
    },
    {
        number: "02",
        title: "Load the unpacked folder",
        body: 'Click "Load unpacked" and select the FlowPulse extension folder (the one containing manifest.json).',
    },
    {
        number: "03",
        title: "Confirm & pin",
        body: "The extension will appear in your list. Pin it from the puzzle-piece menu.",
    },
];

function StepCard({ step, delay }: { step: Step; delay: number }) {
    return (
        <motion.div
            className="flex gap-4 rounded-2xl p-5"
            style={{
                background: "rgba(5,37,88,0.35)",
                border: `1px solid rgba(82,127,176,0.12)`,
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-[11px] font-bold font-mono"
                style={{ background: `linear-gradient(135deg, ${ACCENT}55, ${MID})`, color: LIGHT }}
            >
                {step.number}
            </div>
            <div>
                <p className="mb-1 text-sm font-semibold text-white">{step.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: `${LIGHT}80` }}>{step.body}</p>
            </div>
        </motion.div>
    );
}

function Accordion({ label, children }: { label: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid rgba(82,127,176,0.12)` }}>
            <button
                onClick={() => setOpen(o => !o)}
                className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold text-white transition-colors"
                style={{ background: "rgba(5,37,88,0.4)" }}
            >
                {label}
                <motion.svg
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: ACCENT }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </motion.svg>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{ overflow: "hidden", background: "rgba(1,16,35,0.6)" }}
                    >
                        <div className="flex flex-col gap-3 p-4">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function ExtensionDownloadPage() {
    const navigate = useNavigate();

    return (
        <div
            className="relative flex min-h-screen items-center justify-center px-4 py-16"
            style={{ background: DEEP }}
        >
            {/* Ambient glow */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: `
            radial-gradient(ellipse 70% 50% at 50% 0%, rgba(82,127,176,0.14) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 80% 80%, rgba(5,37,88,0.8) 0%, transparent 60%)
          `,
                }}
            />

            {/* Grid texture */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage: `
            linear-gradient(90deg, rgba(82,127,176,0.03) 1px, transparent 1px),
            linear-gradient(0deg, rgba(82,127,176,0.03) 1px, transparent 1px)
          `,
                    backgroundSize: "60px 60px",
                }}
            />

            <div className="relative z-10 w-full max-w-xl">

                {/* Header */}
                <motion.div
                    className="mb-10 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    {/* Icon */}
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl"
                        style={{
                            background: `linear-gradient(135deg, ${MID}, ${ACCENT})`,
                            boxShadow: `0 0 50px rgba(82,127,176,0.35), inset 0 1px 0 rgba(124,159,201,0.2)`,
                        }}>
                        <svg className="h-9 w-9 text-white" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>

                    <h1 className="mb-2 font-display text-4xl font-bold text-white">
                        Get the Extension
                    </h1>
                    <p className="text-sm leading-relaxed" style={{ color: `${LIGHT}80` }}>
                        Install FlowPulse in Chrome to start tracking your productivity in real-time.
                    </p>
                </motion.div>

                {/* Download card */}
                <motion.div
                    className="mb-6 rounded-3xl p-8"
                    style={{
                        background: `linear-gradient(135deg, rgba(5,37,88,0.7) 0%, rgba(1,16,35,0.9) 100%)`,
                        border: `1px solid rgba(82,127,176,0.2)`,
                        boxShadow: `0 0 60px rgba(82,127,176,0.08)`,
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    {/* Primary download button */}
                    <a
                        href="/flowpulse.crx"
                        download="FlowPulse.crx"
                        className="group relative mb-8 flex items-center justify-center gap-3 overflow-hidden rounded-2xl py-4 text-base font-bold text-white transition-all duration-300"
                        style={{
                            background: `linear-gradient(135deg, ${ACCENT}, ${MID} 60%, ${DEEP})`,
                            boxShadow: `0 0 30px rgba(82,127,176,0.35)`,
                            textDecoration: "none",
                        }}
                    >
                        <div className="absolute inset-x-0 top-0 h-px"
                            style={{ background: `linear-gradient(90deg, transparent, ${LIGHT}60, transparent)` }} />
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download FlowPulse Extension
                    </a>

                    {/* Install steps */}
                    <div className="flex flex-col gap-3">
                        {INSTALL_STEPS.map((step, i) => (
                            <StepCard key={i} step={step} delay={0.25 + i * 0.08} />
                        ))}
                    </div>
                </motion.div>

                {/* Fallback accordion */}
                <motion.div
                    className="mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <Accordion label="⚙️ Alternative: Manual install with Developer Mode">
                        {FALLBACK_STEPS.map((step, i) => (
                            <StepCard key={i} step={step} delay={0} />
                        ))}
                    </Accordion>
                </motion.div>

                {/* Skip */}
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.75, duration: 0.5 }}
                >
                    <button
                        onClick={() => navigate("/app")}
                        className="text-xs transition-colors"
                        style={{ color: `${ACCENT}60` }}
                        onMouseEnter={e => (e.currentTarget.style.color = LIGHT)}
                        onMouseLeave={e => (e.currentTarget.style.color = `${ACCENT}60`)}
                    >
                        Skip for now → Go to Dashboard
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
