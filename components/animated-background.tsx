'use client'

import { motion } from 'framer-motion'

export function AnimatedBackground({ variant = 'default' }: { variant?: 'default' | 'subtle' | 'auth' }) {
  const opacity = variant === 'subtle' ? 0.35 : variant === 'auth' ? 0.5 : 0.45

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-mesh" />
      <motion.div
        className="absolute -left-32 top-0 h-[480px] w-[480px] rounded-full bg-primary/20 blur-[100px]"
        style={{ opacity }}
        animate={{ x: [0, 80, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/15 blur-[90px] dark:bg-violet-400/20"
        style={{ opacity }}
        animate={{ x: [0, -60, 0], y: [0, 50, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full bg-cyan-500/10 blur-[80px] dark:bg-cyan-400/15"
        style={{ opacity }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 bg-grid opacity-[0.03] dark:opacity-[0.06]" />
    </div>
  )
}
