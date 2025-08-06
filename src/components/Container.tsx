import { cn } from '@/utils/cn';
import React from 'react'
import { motion } from 'motion/react';
const Container = ({children, className}:{
    children: React.ReactNode;
    className?: string;
}) => {
  

  const borderVariant = {
    initial: {
      opacity: 0,
      height: '0px',
    },
    animate: {
      opacity: 1,
      height: '100%',
      transition: {
        duration: 1,
        ease: "easeOut" as const,

      },
    },
  }

  return (
    <div className={cn("w-full h-full max-w-6xl mx-auto px-4 relative", className)}>
      <motion.div variants={borderVariant} initial="initial" animate="animate" className='h-full min-h-screen w-px bg-gradient-to-b from-transparent via-primary to-transparent absolute -left-4'>
      </motion.div>
      <motion.div variants={borderVariant} initial="initial" animate="animate" className='h-full min-h-screen w-px bg-gradient-to-b from-transparent via-primary to-transparent absolute -right-4'>
      </motion.div>
      {children}
    </div>
  )
}

export default Container