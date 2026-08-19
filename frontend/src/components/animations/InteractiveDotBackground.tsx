'use client';

import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';

export function InteractiveDotBackground() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springX = useSpring(mouseX, { stiffness: 150, damping: 20, mass: 0.5 });
    const springY = useSpring(mouseY, { stiffness: 150, damping: 20, mass: 0.5 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
            {/* Base faded dots (smaller) */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="dotPatternBase" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                        <circle cx="8" cy="8" r="1" className="fill-muted-foreground opacity-20" />
                    </pattern>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#dotPatternBase)" />
            </svg>

            {/* Interactive highlighted and zoomed dots masked to mouse position */}
            <motion.div
                className="absolute inset-0 w-full h-full"
                style={{
                    WebkitMaskImage: useMotionTemplate`radial-gradient(350px circle at ${springX}px ${springY}px, black, transparent)`
                }}
            >
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="dotPatternActive" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                            <circle cx="8" cy="8" r="2.5" className="fill-primary" />
                        </pattern>
                    </defs>
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#dotPatternActive)" />
                </svg>
            </motion.div>
        </div>
    );
}
