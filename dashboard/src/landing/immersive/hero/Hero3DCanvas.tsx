import { useRef, Suspense, lazy } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

// Floating geometric mesh - slow orbit reacting to mouse
function FloatingGeometry({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
    const group = useRef<THREE.Group>(null);
    const ico = useRef<THREE.Mesh>(null);
    const dodec = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (group.current) {
            // Slow base rotation
            group.current.rotation.y = t * 0.06;
            group.current.rotation.x = t * 0.03;
            // Mouse parallax offset
            group.current.rotation.y += mouseX * 0.0008;
            group.current.rotation.x += mouseY * 0.0005;
        }
        if (ico.current) {
            ico.current.rotation.z = t * 0.12;
        }
        if (dodec.current) {
            dodec.current.rotation.x = t * 0.08;
            dodec.current.rotation.z = t * 0.05;
        }
    });

    return (
        <group ref={group} position={[0, 0, 0]}>
            {/* Center icosahedron - wireframe glow */}
            <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.4}>
                <mesh ref={ico} position={[0, 0, 0]}>
                    <icosahedronGeometry args={[1.6, 0]} />
                    <meshStandardMaterial
                        color="#58f0ff"
                        emissive="#58f0ff"
                        emissiveIntensity={0.15}
                        wireframe
                        transparent
                        opacity={0.4}
                    />
                </mesh>
                {/* Inner solid */}
                <mesh position={[0, 0, 0]}>
                    <icosahedronGeometry args={[1.55, 0]} />
                    <MeshTransmissionMaterial
                        backside
                        samples={4}
                        resolution={256}
                        anisotropicBlur={0.1}
                        thickness={0.4}
                        roughness={0}
                        color="#9c6bff"
                        chromaticAberration={0.06}
                    />
                </mesh>
            </Float>

            {/* Orbiting dodecahedron */}
            <Float speed={1.2} rotationIntensity={0.5} floatIntensity={0.6}>
                <mesh ref={dodec} position={[3.2, 0.5, -1]}>
                    <dodecahedronGeometry args={[0.55, 0]} />
                    <meshStandardMaterial
                        color="#9c6bff"
                        emissive="#9c6bff"
                        emissiveIntensity={0.2}
                        wireframe
                        transparent
                        opacity={0.5}
                    />
                </mesh>
            </Float>

            {/* Small orbiting tetrahedra */}
            {([
                [-2.5, 1.2, 0.5, "#f5c842"],
                [2.8, -1.5, 1, "#4ade80"],
                [-3, -1, -1, "#58f0ff"],
            ] as [number, number, number, string][]).map(([x, y, z, color], i) => (
                <Float key={i} speed={1.5 + i * 0.3} rotationIntensity={1} floatIntensity={0.8}>
                    <mesh position={[x, y, z]}>
                        <tetrahedronGeometry args={[0.3, 0]} />
                        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} wireframe transparent opacity={0.6} />
                    </mesh>
                </Float>
            ))}

            {/* Particle field */}
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[new Float32Array(
                            Array.from({ length: 300 }, () => [(Math.random() - 0.5) * 16, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 16]).flat()
                        ), 3]}
                    />
                </bufferGeometry>
                <pointsMaterial size={0.02} color="#58f0ff" transparent opacity={0.5} sizeAttenuation />
            </points>
        </group>
    );
}

interface Hero3DCanvasProps {
    mouseX: number;
    mouseY: number;
}

export function Hero3DCanvas({ mouseX, mouseY }: Hero3DCanvasProps) {
    return (
        <Canvas
            camera={{ position: [0, 0, 6], fov: 60 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
            style={{ background: "transparent" }}
        >
            <ambientLight intensity={0.3} />
            <pointLight position={[5, 5, 5]} intensity={1.2} color="#58f0ff" />
            <pointLight position={[-5, -3, -5]} intensity={0.8} color="#9c6bff" />
            <pointLight position={[0, -5, 2]} intensity={0.5} color="#f5c842" />
            <Suspense fallback={null}>
                <FloatingGeometry mouseX={mouseX} mouseY={mouseY} />
            </Suspense>
        </Canvas>
    );
}

// Mobile CSS fallback
export function Hero3DFallback() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div
                className="h-64 w-64 animate-[spin_20s_linear_infinite] rounded-full opacity-40"
                style={{
                    background: "conic-gradient(from 0deg, transparent, rgba(88,240,255,0.4), rgba(156,107,255,0.4), transparent)",
                    filter: "blur(40px)",
                }}
            />
        </div>
    );
}
