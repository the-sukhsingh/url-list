import React, { ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/utils/cn";

const DURATION = 0.25
const STAGGER = 0.025

interface FlipLinkProps {
    children: string;
    className?: string;
}

const FlipLink: React.FC<FlipLinkProps> = ({ children, className }) => {
    return (
        <motion.div
            initial="initial"
            whileHover="hovered"
            className={cn("relative pl-2 overflow-hidden whitespace-nowrap text-4xl font-light uppercase sm:text-7xl md:text-8xl", className)}
            style={{
                lineHeight: 0.9,
            }}
        >
            <div>
                {children.split("").map((l, i) => (
                    <motion.span
                        variants={{
                            initial: {
                                y: 0,
                            },
                            hovered: {
                                y: "-100%",
                            },
                        }}
                        transition={{
                            duration: DURATION,
                            ease: "easeInOut",
                            delay: STAGGER * i,
                        }}
                        className="inline-block"
                        key={i}
                    >
                        {l}
                    </motion.span>
                ))}
            </div>
            <div className="absolute inset-0">
                {children.split("").map((l, i) => (
                    <motion.span
                        variants={{
                            initial: {
                                y: "100%",
                            },
                            hovered: {
                                y: 0,
                            },
                        }}
                        transition={{
                            duration: DURATION,
                            ease: "easeInOut",
                            delay: STAGGER * i,
                        }}
                        className="inline-block"
                        key={i}
                    >
                        {l}
                    </motion.span>
                ))}
            </div>
        </motion.div>
    )
}

export default FlipLink
