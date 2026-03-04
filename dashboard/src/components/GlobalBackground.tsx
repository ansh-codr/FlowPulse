import videoSrc from "../assets/videos/robin-julian-lee-pose-Video.mp4";

export function GlobalBackground() {
    return (
        <>
            {/* Absolute black base */}
            <div className="fixed inset-0 z-[-3] bg-[#08060A]" />

            {/* Cinematic video — low opacity, no sticky/lag issues */}
            <video
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="fixed inset-0 z-[-2] h-full w-full object-cover"
                style={{
                    opacity: 0.22,
                    filter: "brightness(0.8) saturate(0.7) contrast(1.1)",
                    willChange: "auto",   // don't force GPU layer on this — avoids sticky scrolling
                }}
            />

            {/* Gradient overlay — smooth vignette */}
            <div
                className="fixed inset-0 z-[-1] pointer-events-none"
                style={{
                    background: [
                        "radial-gradient(ellipse at 50% 0%, rgba(255,107,53,0.04) 0%, transparent 60%)",
                        "radial-gradient(ellipse at 80% 100%, rgba(255,209,102,0.03) 0%, transparent 50%)",
                        "linear-gradient(to bottom, rgba(8,6,10,0.5) 0%, transparent 30%, rgba(8,6,10,0.5) 100%)",
                    ].join(", "),
                }}
            />
        </>
    );
}

// Reusable glass style constants
export const GLASS_STYLE = {
    background: "rgba(10, 8, 6, 0.50)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 107, 53, 0.12)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
};

export const GLASS_STYLE_LIGHT = {
    background: "rgba(255, 255, 255, 0.02)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
};
