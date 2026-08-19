'use client';

import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CursorGlow() {
    // Raw mouse coordinates
    const mouseX = useMotionValue(-1000);
    const mouseY = useMotionValue(-1000);

    // Spring for the large ambient glow (smooth, relaxed tracking)
    const glowX = useSpring(mouseX, { damping: 25, stiffness: 120, mass: 0.5 });
    const glowY = useSpring(mouseY, { damping: 25, stiffness: 120, mass: 0.5 });

    // Spring for the sharp tip (faster, tracks closely like a snake head)
    const dotX = useSpring(mouseX, { damping: 20, stiffness: 300, mass: 0.2 });
    const dotY = useSpring(mouseY, { damping: 20, stiffness: 300, mass: 0.2 });

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener('mousemove', moveCursor);
        return () => {
            window.removeEventListener('mousemove', moveCursor);
        };
    }, [mouseX, mouseY]);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* The small, concentrated core shade (snake tip) */}
            <motion.div
                style={{
                    x: dotX,
                    y: dotY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                className="absolute top-0 left-0 w-[150px] h-[150px] rounded-full opacity-60 mix-blend-screen"
                animate={{
                    background: [
                        "radial-gradient(circle, var(--primary-glow) 0%, transparent 60%)",
                    ],
                }}
            />

            {/* The large ambient glow */}
            <motion.div
                style={{
                    x: glowX,
                    y: glowY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-30 mix-blend-screen"
                animate={{
                    background: [
                        "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)",
                    ],
                }}
            />
        </div>
    );
}
