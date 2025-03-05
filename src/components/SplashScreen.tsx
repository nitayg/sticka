
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
          src="/icons/icon-192x192.png" 
          alt="Logo" 
          className="splash-logo" 
        />
        <h1 className="text-2xl font-bold mt-4">STICKA</h1>
      </div>
    </div>
  );
};

export default SplashScreen;
