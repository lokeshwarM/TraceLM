'use client';

import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CursorGlow() {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX - 250);
            cursorY.set(e.clientY - 250);
        };
        window.addEventListener('mousemove', moveCursor);
        return () => {
            window.removeEventListener('mousemove', moveCursor);
        };
    }, [cursorX, cursorY]);

    return (
        <motion.div
            style={{
                x: cursorXSpring,
                y: cursorYSpring,
            }}
            className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none z-0 mix-blend-normal opacity-40 dark:opacity-20"
            animate={{
                background: [
                    "radial-gradient(circle, var(--primary-glow) 0%, rgba(255,255,255,0) 70%)",
                ],
            }}
        />
    );
}
