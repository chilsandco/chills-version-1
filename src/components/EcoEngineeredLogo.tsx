import React from 'react';
import { motion } from 'motion/react';

const EcoEngineeredLogo: React.FC = () => {
  // Animation configuration based on your "System Breathing" concept
  
  // 1. ARRIVE & ALIGN: Initial state is slightly offset
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      x: -8, // More pronounced imperfect alignment initially
      y: -4 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      x: 0, // Snaps into position (Lock)
      y: 0,
      transition: {
        duration: 1.5,
        ease: [0.19, 1, 0.22, 1], // Sharp snap out
      }
    },
    breathe: {
      opacity: [0.7, 1, 0.7],
      scale: [1, 1.05, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2 // Start after arrival/lock
      }
    }
  };

  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 0.4, // Increased visibility
      transition: { duration: 2, ease: "easeInOut" }
    }
  };

  return (
    <div id="eco-engineered-logo" className="relative w-32 h-32 flex items-center justify-center">
      <svg 
        width="120" 
        height="120" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="transform-gpu"
      >
        {/* BACKGROUND GRID: Arrives Softly (0-1s) */}
        <motion.g variants={lineVariants} initial="hidden" animate="visible">
          {/* Vertical Grid */}
          <line x1="20" y1="10" x2="20" y2="90" stroke="#5CA904" strokeWidth="0.5" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="#5CA904" strokeWidth="0.5" />
          <line x1="80" y1="10" x2="80" y2="90" stroke="#5CA904" strokeWidth="0.5" />
          
          {/* Horizontal Grid */}
          <line x1="10" y1="20" x2="90" y2="20" stroke="#5CA904" strokeWidth="0.5" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="#5CA904" strokeWidth="0.5" />
          <line x1="10" y1="80" x2="90" y2="80" stroke="#5CA904" strokeWidth="0.5" />
        </motion.g>

        {/* CALIBRATION BRACKETS: Arrive & Lock (1-3s) */}
        <motion.path
          d="M15 15H25M15 15V25"
          stroke="#5CA904"
          strokeWidth="1"
          initial={{ opacity: 0, x: -5, y: -5 }}
          animate={{ opacity: 0.6, x: 0, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
        <motion.path
          d="M85 15H75M85 15V25"
          stroke="#5CA904"
          strokeWidth="1"
          initial={{ opacity: 0, x: 5, y: -5 }}
          animate={{ opacity: 0.6, x: 0, y: 0 }}
          transition={{ duration: 1.5, delay: 0.7 }}
        />
        <motion.path
          d="M85 85H75M85 85V75"
          stroke="#5CA904"
          strokeWidth="1"
          initial={{ opacity: 0, x: 5, y: 5 }}
          animate={{ opacity: 0.6, x: 0, y: 0 }}
          transition={{ duration: 1.5, delay: 0.9 }}
        />
        <motion.path
          d="M15 85H25M15 85V75"
          stroke="#5CA904"
          strokeWidth="1"
          initial={{ opacity: 0, x: -5, y: 5 }}
          animate={{ opacity: 0.6, x: 0, y: 0 }}
          transition={{ duration: 1.5, delay: 1.1 }}
        />

        {/* THE SYSTEM CORE: Align & Breathe (Loop) */}
        <motion.g
          initial="hidden"
          animate={["visible", "breathe"]}
        >
          {/* Main diamond - The lock point */}
          <motion.path
            d="M50 35L65 50L50 65L35 50Z"
            fill="transparent"
            stroke="#5CA904"
            strokeWidth="1.5"
            variants={{
              hidden: { pathLength: 0, opacity: 0, scale: 0.8 },
              visible: { 
                pathLength: 1, 
                opacity: 1, 
                scale: 1,
                transition: { duration: 2, delay: 1.5, ease: "easeOut" }
              },
              breathe: {
                opacity: [0.8, 1, 0.8],
                scale: [1, 1.02, 1],
                transition: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 3 }
              }
            }}
          />

          {/* Shifting Modules (Calibration behavior) */}
          <motion.rect
            x="48" y="48" width="4" height="4"
            fill="#5CA904"
            variants={itemVariants}
          />
          
          <motion.rect
            x="48" y="28" width="4" height="4"
            fill="#5CA904"
            variants={itemVariants}
            style={{ originX: "50px", originY: "50px" }}
          />

          <motion.rect
            x="48" y="68" width="4" height="4"
            fill="#5CA904"
            variants={itemVariants}
            style={{ originX: "50px", originY: "50px" }}
          />
          
          <motion.rect
            x="28" y="48" width="4" height="4"
            fill="#5CA904"
            variants={itemVariants}
            style={{ originX: "50px", originY: "50px" }}
          />

          <motion.rect
            x="68" y="48" width="4" height="4"
            fill="#5CA904"
            variants={itemVariants}
            style={{ originX: "50px", originY: "50px" }}
          />
        </motion.g>

        {/* Central Pulse (Breathing system) */}
        <motion.circle
          cx="50" cy="50" r="1.5"
          fill="#5CA904"
          animate={{
            scale: [1, 2, 1],
            opacity: [0.8, 0, 0.8]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </svg>
      
      {/* Precision Micro-shifts - corner ticks */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-0 left-0 w-1 h-1 bg-[#5CA904]/20"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-1 h-1 bg-[#5CA904]/20"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, delay: 1, repeat: Infinity }}
        />
      </div>
    </div>
  );
};

export default EcoEngineeredLogo;
