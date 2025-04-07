
import { useEffect } from "react";

export const useInventoryChangeEvents = (throttledRefresh: () => void) => {
  // Listen for inventory changes to refresh stickers
  useEffect(() => {
    const handleInventoryChanged = () => {
      console.log("[useInventoryChangeEvents] Inventory data changed event received");
      throttledRefresh();
    };
    
    window.addEventListener('inventoryDataChanged', handleInventoryChanged);
    return () => {
      window.removeEventListener('inventoryDataChanged', handleInventoryChanged);
    };
  }, [throttledRefresh]);
};
