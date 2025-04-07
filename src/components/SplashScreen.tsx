
import React, { useEffect, useState } from "react";
import "../styles/smooth-animations.css";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
  minDisplayTime?: number;
}

const SplashScreen = ({ onComplete, minDisplayTime = 2500 }: SplashScreenProps) => {
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  
  useEffect(() => {
    // Set a timer to ensure the splash screen stays visible for at least minDisplayTime
    const timer = setTimeout(() => {
      setIsAnimationComplete(true);
      // Add a short delay for exit animation
      setTimeout(onComplete, 800);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [onComplete, minDisplayTime]);
  
  return (
    <AnimatePresence>
      {!isAnimationComplete && (
        <motion.div 
          className="fixed inset-0 z-50 bg-gradient-to-br from-black to-slate-900 flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Background particles */}
          {Array.from({ length: 20 }).map((_, index) => (
            <motion.div
              key={`particle-${index}`}
              className="absolute rounded-full bg-blue-500/20"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 0.5 + 0.5,
                opacity: Math.random() * 0.5
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 0.8 + 0.2,
                opacity: Math.random() * 0.7
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              style={{
                width: `${Math.random() * 50 + 10}px`,
                height: `${Math.random() * 50 + 10}px`,
                filter: `blur(${Math.random() * 5 + 2}px)`
              }}
            />
          ))}

          <div className="w-full max-w-md px-8 flex flex-col items-center space-y-8 text-center relative z-10">
            <div className="flex flex-col items-center space-y-6">
              <motion.div 
                className="relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.2
                }}
              >
                <motion.div 
                  className="absolute inset-0 bg-blue-500/20 rounded-full opacity-75"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                
                <img
                  src="/lovable-uploads/46e6bbf0-717d-461d-95e4-1584072c6ff0.png"
                  alt="Logo"
                  className="w-32 h-32 relative z-10"
                />
                
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl"
                  animate={{
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{ 
                    scale: 1.5 
                  }}
                />
              </motion.div>
              
              <motion.h1 
                className="text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                STICKA
              </motion.h1>
              
              <motion.p 
                className="text-gray-400 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                אוסף המדבקות שלי
              </motion.p>
              
              <motion.div 
                className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full mt-4"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              />
            </div>
          </div>
          
          <motion.div 
            className="absolute bottom-12 w-full flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <div className="flex space-x-2">
              <motion.span 
                className="h-2 w-2 rounded-full bg-blue-500"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              />
              <motion.span 
                className="h-2 w-2 rounded-full bg-blue-400"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
              <motion.span 
                className="h-2 w-2 rounded-full bg-blue-300"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
