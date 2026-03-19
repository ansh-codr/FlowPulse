import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

const FRAME_COUNT = 150;
const PRELOAD_COUNT = 15;

const getFramePath = (index: number) => {
    const paddedIndex = index.toString().padStart(4, "0");
    return `/frames_hero/frame_${paddedIndex}.jpg`;
};

export function HeroScrollytelling() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(FRAME_COUNT + 1).fill(null));
    const [loadedFrames, setLoadedFrames] = useState(0);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const currentFrameRef = useRef(1);

    useEffect(() => {
        for (let i = 1; i <= PRELOAD_COUNT; i++) {
            const img = new Image();
            img.src = getFramePath(i);
            img.onload = () => {
                imagesRef.current[i] = img;
                setLoadedFrames(prev => prev + 1);
            };
        }

        setTimeout(() => {
            for (let i = PRELOAD_COUNT + 1; i <= FRAME_COUNT; i++) {
                const img = new Image();
                img.src = getFramePath(i);
                img.onload = () => {
                    imagesRef.current[i] = img;
                    setLoadedFrames(prev => Math.min(prev + 1, FRAME_COUNT));
                };
            }
        }, 500);
    }, []);

    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            const nextFrame = Math.max(1, Math.min(FRAME_COUNT, Math.floor(latest * FRAME_COUNT) + 1));
            currentFrameRef.current = nextFrame;
        });
        return () => unsubscribe();
    }, [scrollYProgress]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        let animationFrameId: number;
        let cWidth = canvas.parentElement?.clientWidth || window.innerWidth;
        let cHeight = canvas.parentElement?.clientHeight || window.innerHeight;

        const handleResize = () => {
            if (canvas.parentElement) {
                const rect = canvas.parentElement.getBoundingClientRect();
                cWidth = rect.width;
                cHeight = rect.height;
                canvas.width = cWidth;
                canvas.height = cHeight;
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        const render = () => {
            const frameIndex = currentFrameRef.current;
            const img = imagesRef.current[frameIndex];

            if (img && img.complete) {
                ctx.fillStyle = "#050505";
                ctx.fillRect(0, 0, cWidth, cHeight);

                const hRatio = cWidth / img.width;
                const vRatio = cHeight / img.height;
                const ratio = Math.max(hRatio, vRatio);

                const centerShiftX = (cWidth - img.width * ratio) / 2;
                const centerShiftY = (cHeight - img.height * ratio) / 2;

                ctx.drawImage(
                    img,
                    0, 0, img.width, img.height,
                    centerShiftX, centerShiftY, img.width * ratio, img.height * ratio
                );
            }

            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
        };
    }, [loadedFrames]);

    // Opacity mapping for Hero section narratives
    const heroTitleOpacity = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.5], [1, 1, 0, 0]);
    const heroTitleY = useTransform(scrollYProgress, [0, 0.4], [0, -50]);

    const feature1Opacity = useTransform(scrollYProgress, [0.3, 0.5, 0.7, 0.9], [0, 1, 1, 0]);
    const feature1Y = useTransform(scrollYProgress, [0.3, 0.5, 0.7, 0.9], [50, 0, 0, -50]);

    return (
        <section ref={containerRef} id="overview" className="relative w-full h-[300vh] bg-[#050505]">
            <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#050505] flex items-center justify-center">
                <canvas 
                    ref={canvasRef} 
                    className="absolute inset-0 w-full h-full object-cover z-0" 
                    style={{ filter: "brightness(0.7)" }} 
                />

                <div className="absolute inset-0 z-10 flex items-center w-full max-w-7xl mx-auto px-6 md:px-12 pointer-events-none">
                    
                    {/* Part 1: Hero Splash */}
                    <motion.div 
                        className="absolute inset-0 flex flex-col items-center justify-center text-center w-full px-6"
                        style={{ opacity: heroTitleOpacity, y: heroTitleY }}
                    >
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6" style={{ textShadow: "0 4px 24px rgba(0,0,0,0.6)" }}>
                            The Pulse of Productivity
                        </h1>
                        <p className="text-lg md:text-2xl text-white/70 max-w-2xl mx-auto font-medium shadow-black drop-shadow-lg">
                            Experience the seamless blend of intelligent workflows and breathtaking design.
                        </p>
                    </motion.div>

                    {/* Part 2: Feature Intro */}
                    <motion.div 
                        className="absolute w-full px-6 md:px-0 md:left-12 flex flex-col items-start justify-center h-full max-w-lg md:max-w-xl text-left"
                        style={{ opacity: feature1Opacity, y: feature1Y }}
                    >
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
                            Intelligently Engineered.
                        </h2>
                        <p className="text-lg md:text-xl text-white/70 font-medium">
                            Every pixel purposefully placed. Start by exploring the fluid mechanics of our core system as you scroll down.
                        </p>
                    </motion.div>
                </div>
                
                {/* Gradient to transition into the bottom section smoothly */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050505] to-transparent z-10 pointer-events-none" />
            </div>
        </section>
    );
}
