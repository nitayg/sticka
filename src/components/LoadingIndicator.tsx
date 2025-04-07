
import React from 'react';

interface LoadingIndicatorProps {
  text?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
};

export default LoadingIndicator;
