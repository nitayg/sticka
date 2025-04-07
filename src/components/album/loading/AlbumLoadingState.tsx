
import React from "react";

interface AlbumLoadingStateProps {
  isLoadingTimeout: boolean;
  throttledRefresh: () => void;
}

const AlbumLoadingState = ({ isLoadingTimeout, throttledRefresh }: AlbumLoadingStateProps) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-center p-12 flex-col">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <div className="text-sm text-muted-foreground">טוען אלבומים...</div>
        
        {isLoadingTimeout && (
          <div className="mt-4 p-4 bg-amber-50 text-amber-700 rounded-md text-center max-w-md">
            <p className="font-semibold">הטעינה אורכת זמן רב</p>
            <p className="text-xs mt-1">ייתכן שיש בעיה בחיבור לשרת או בטעינת הנתונים.</p>
            <button 
              onClick={throttledRefresh}
              className="mt-2 px-4 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-md text-sm font-medium transition-colors"
            >
              נסה שוב
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumLoadingState;
