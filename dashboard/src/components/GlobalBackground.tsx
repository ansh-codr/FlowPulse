
import videoSrc from "../assets/videos/robin-julian-lee-pose-Video.mp4";

export function GlobalBackground() {
    return (
        <>
            {/* Base dark layer */}
            <div className="fixed inset-0 z-[-3] bg-black" />

            {/* Cinematic Video Background */}
            <video
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="fixed inset-0 z-[-2] h-full w-full object-cover opacity-40 filter contrast-125 saturate-50"
            />

            {/* Vignette / Dim Overlay for text readability */}
            <div
                className="fixed inset-0 z-[-1] pointer-events-none"
                style={{
                    background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)"
                }}
            />
            {/* Grain overlay for cinematic feel */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20 mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }} />
        </>
    );
}

export const GLASS_STYLE = {
    background: "rgba(10, 10, 10, 0.45)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
};

export const GLASS_STYLE_LIGHT = {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
};
