
import React, { useEffect, useState } from "react";
import "../styles/smooth-animations.css";

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
      setTimeout(onComplete, 500);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [onComplete, minDisplayTime]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out"
         style={{ opacity: isAnimationComplete ? 0 : 1 }}>
      <div className="w-full max-w-md px-8 flex flex-col items-center space-y-8 text-center">
        <div className="flex flex-col items-center space-y-6 animate-scale-in">
          <div className="relative">
            <img
              src="/lovable-uploads/46e6bbf0-717d-461d-95e4-1584072c6ff0.png"
              alt="Logo"
              className="w-32 h-32 animate-pulse-brief"
            />
            <div className="absolute inset-0 bg-interactive/10 rounded-full animate-ping opacity-75 scale-110"></div>
          </div>
          
          <h1 className="text-3xl font-bold smooth-fade-in delay-300">
            אוסף המדבקות שלי
          </h1>
          
          <p className="text-muted-foreground smooth-fade-in delay-600">
            STICKA
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
