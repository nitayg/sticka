
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
  
  // Add animated particles in the background
  const particles = Array(10).fill(null).map((_, index) => (
    <div 
      key={`particle-${index}`}
      className="absolute rounded-full bg-blue-500/20 animate-pulse"
      style={{
        width: `${Math.random() * 30 + 10}px`,
        height: `${Math.random() * 30 + 10}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        opacity: Math.random() * 0.5 + 0.1,
        animationDuration: `${Math.random() * 3 + 2}s`,
        animationDelay: `${Math.random() * 2}s`
      }}
    />
  ));

  return (
    <div 
      className="fixed inset-0 z-50 bg-gradient-to-br from-black to-slate-900 flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out"
      style={{ opacity: isAnimationComplete ? 0 : 1 }}
    >
      {particles}
      
      <div className="w-full max-w-md px-8 flex flex-col items-center space-y-8 text-center relative z-10">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping opacity-75 scale-110"></div>
            <img
              src="/lovable-uploads/65da5d4b-d831-4275-952d-d4ec3c19726e.png"
              alt="Logo"
              className="w-32 h-32 logo-animation relative z-10"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-yellow-500/10 rounded-full animate-pulse opacity-75 scale-125 blur-xl"></div>
          </div>
          
          <h1 className="text-4xl font-bold text-white smooth-fade-in delay-300 bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-100">
            STICKA
          </h1>
          
          <p className="text-gray-400 smooth-fade-in delay-600 text-lg">
            אוסף המדבקות שלי
          </p>
          
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full mt-4 smooth-fade-in delay-800"></div>
        </div>
      </div>
      
      <div className="absolute bottom-12 w-full flex justify-center">
        <div className="flex space-x-2 smooth-fade-in delay-900">
          <span className="animate-bounce h-2 w-2 rounded-full bg-yellow-500 delay-100"></span>
          <span className="animate-bounce h-2 w-2 rounded-full bg-yellow-400 delay-200"></span>
          <span className="animate-bounce h-2 w-2 rounded-full bg-yellow-300 delay-300"></span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
