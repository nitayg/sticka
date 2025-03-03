
import React from "react";

interface MobileHeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobileHeader = ({ isMenuOpen, setIsMenuOpen }: MobileHeaderProps) => {
  return (
    <header className="lg:hidden sticky top-0 z-40 glass border-b border-border h-14 flex items-center justify-between px-4">
      <div className="flex items-center">
        <span className="font-semibold text-lg">אוסף מדבקות</span>
      </div>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          {isMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          )}
        </svg>
      </button>
    </header>
  );
};

export default MobileHeader;
