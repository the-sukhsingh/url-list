import { motion, AnimatePresence } from 'motion/react'
import React, { useState } from 'react'
import Link from 'next/link'

const Hero = () => {
  const [isHovered, setIsHovered] = useState(false);

  const cardVariant = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.8,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
  }

  const textVariant = {
    normal: {
      filter: "blur(0px)",
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const,
      },
    },
    blurred: {
      filter: "blur(4px)",
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const,
      },
    },
  }

  const buttonVariant = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "backOut" as const,
      },
    },
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Grid Background */}
      <div className="absolute inset-0 ">
        <div 
          className="absolute inset-0 opacity-30 bg-grid-dark dark:bg-grid-light"
          style={{
            backgroundSize: '30px 30px'
          }}
        />
      </div>

      {/* Main Card */}
      <motion.div
        variants={cardVariant}
        initial="initial"
        animate="animate"
        className="relative z-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-gray-200 p-12 max-w-2xl mx-auto relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-red-400 rounded-full"></div>
          <div className="absolute top-4 left-12 w-3 h-3 bg-yellow-400 rounded-full"></div>
          <div className="absolute top-4 left-20 w-3 h-3 bg-green-400 rounded-full"></div>

          {/* Content */}
          <div className="text-center relative h-48 md:h-64 flex items-center justify-center">
            {/* Main Text */}
            <motion.div
              variants={textVariant}
              animate={isHovered ? "blurred" : "normal"}
              className="relative"
            >
              <h1 className="text-5xl md:text-7xl font-bold text-neutral-900 dark:text-neutral-200 leading-tight">
                Share Many Links
                <br />
                <span className="text-neutral-600 dark:text-neutral-300">In One Link</span>
              </h1>
            </motion.div>

            {/* Get Started Button - appears on hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  variants={buttonVariant}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Link href="/build">
                    <motion.button
                      whileHover={{ scale: 1 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-black dark:bg-neutral-200 text-white dark:text-neutral-800 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    >
                      Get Started
                    </motion.button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-blue-50 dark:to-blue-950 opacity-30 rounded-3xl pointer-events-none"></div>
        </div>

        {/* Floating elements */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-lg opacity-20 -z-10"
        />
        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-6 -left-6 w-6 h-6 bg-purple-500 rounded-full opacity-20 -z-10"
        />
      </motion.div>
    </div>
)}

export default Hero