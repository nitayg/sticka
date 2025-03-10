
import React from "react";

interface ViewModeToggleProps {
  viewMode: "grid" | "list" | "compact";
  setViewMode: (mode: "grid" | "list" | "compact") => void;
  showImages: boolean;
  setShowImages: (show: boolean) => void;
  iconOnly?: boolean;
}

const ViewModeToggle = () => {
  // Component is now empty as requested
  return null;
};

export default ViewModeToggle;
