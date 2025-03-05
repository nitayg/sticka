
import { useState, useEffect } from 'react';

interface SplashScreenProps {
  minDisplayTime?: number; // זמן מינימלי להצגה במילישניות
}

const SplashScreen = ({ minDisplayTime = 1500 }: SplashScreenProps) => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    
    // תפקיד הפונקציה הזו הוא להסתיר את מסך הפתיחה
    const hideSplash = () => {
      const elapsedTime = Date.now() - startTime;
      
      // אם עבר זמן מספיק, הסתר מיד
      if (elapsedTime >= minDisplayTime) {
        setHidden(true);
      } else {
        // אחרת, המתן עד שיעבור הזמן המינימלי
        const remainingTime = minDisplayTime - elapsedTime;
        setTimeout(() => setHidden(true), remainingTime);
      }
    };
    
    // הסתר את ה-splash אחרי שהאפליקציה נטענה
    window.addEventListener('load', hideSplash);
    
    // במקרה ש-window.load כבר התרחש
    if (document.readyState === 'complete') {
      hideSplash();
    }
    
    // ניקוי
    return () => {
      window.removeEventListener('load', hideSplash);
    };
  }, [minDisplayTime]);

  if (hidden) return null;

  return (
    <div className={`splash-screen ${hidden ? 'hidden' : ''}`}>
      <div className="flex flex-col items-center justify-center">
        <img 
          src="/lovable-uploads/f11addb3-a4c2-4a3a-a33c-0d2fac95d93f.png" 
          alt="STICKA Logo" 
          className="splash-logo w-48 object-contain" 
        />
        <p className="text-sm text-muted-foreground mt-2">STICKER COLLECTOR APP</p>
      </div>
    </div>
  );
};

export default SplashScreen;
