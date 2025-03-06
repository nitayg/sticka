import React, { useEffect, useState } from 'react';
import './LogoAnimation.css';

const LogoAnimation: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000); // 2-second animation

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`logo-animation ${isVisible ? 'visible' : 'hidden'}`}>
      <img src="/path-to-your-logo.png" alt="Logo" />
    </div>
  );
};

export default LogoAnimation;
