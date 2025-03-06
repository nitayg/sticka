
import React, { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import "../styles/smooth-animations.css";

interface SplashScreenProps {
  onComplete: () => void;
  minDisplayTime?: number; // Added optional prop for minimum display time
}

const SplashScreen = ({ onComplete, minDisplayTime = 0 }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [isShowing, setIsShowing] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    
    // סימולציה של טעינה מהירה יותר
    const interval = setInterval(() => {
      setProgress(prev => {
        // האץ את הקצב כאשר מגיעים לחצי הדרך
        const increment = prev > 50 ? 5 : 3;
        const newProgress = prev + increment;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // חשב את הזמן שעבר מתחילת הטעינה
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
          
          // הוסף השהייה קצרה לפני שתסיר את מסך ההתחלה
          setTimeout(() => {
            setIsShowing(false);
            // חכה שהאנימציה תסתיים לפני שתקרא ל-onComplete
            setTimeout(onComplete, 450);
          }, 300 + remainingTime);
          
          return 100;
        }
        return newProgress;
      });
    }, 40); // מהירות טעינה מהירה יותר
    
    // נקה את הטיימר כאשר הרכיב נעלם
    return () => clearInterval(interval);
  }, [onComplete, minDisplayTime]);

  if (!isShowing) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center page-transition-exit-active">
      <div className="w-full max-w-md px-8 flex flex-col items-center space-y-6 text-center">
        <div className="flex flex-col items-center space-y-4 smooth-scale-in">
          <img
            src="/placeholder.svg"
            alt="Logo"
            className="w-24 h-24 animate-pulse"
          />
          <h1 className="text-2xl font-bold">אוסף המדבקות שלי</h1>
          <p className="text-sm text-muted-foreground">
            טוען את האפליקציה...
          </p>
        </div>

        {/* פס התקדמות משופר */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-4 smooth-fade-in">
          <div
            className="h-full bg-primary rounded-full transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* אנימציית טעינה */}
        <div className="smooth-fade-in delay-200">
          {progress < 100 ? (
            <div className="flex space-x-2 items-center justify-center">
              <span className="animate-bounce delay-0 h-2 w-2 bg-primary rounded-full"></span>
              <span className="animate-bounce delay-100 h-2 w-2 bg-primary rounded-full"></span>
              <span className="animate-bounce delay-200 h-2 w-2 bg-primary rounded-full"></span>
            </div>
          ) : (
            <p className="text-primary text-sm font-medium">מוכן!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
