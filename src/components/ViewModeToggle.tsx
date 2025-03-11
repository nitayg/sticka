
// This component is now an empty component since we've been asked to remove these buttons
interface ViewModeToggleProps {
  viewMode?: "grid" | "list" | "compact";
  setViewMode?: (mode: "grid" | "list" | "compact") => void;
  showImages?: boolean;
  setShowImages?: (show: boolean) => void;
  iconOnly?: boolean;
}

const ViewModeToggle = (_props: ViewModeToggleProps) => {
  return null;
};

export default ViewModeToggle;
