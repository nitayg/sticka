
import Header from "../../Header";

/**
 * Loading state component for the inventory view
 */
const InventoryLoading = () => {
  return (
    <div className="space-y-3 animate-fade-in">
      <Header 
        title="מלאי" 
        subtitle="ניהול אוסף המדבקות שלך"
      />
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    </div>
  );
};

export default InventoryLoading;
