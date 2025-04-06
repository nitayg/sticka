
import InventoryLayout from "./inventory/layout/InventoryLayout";

/**
 * Main entry point for the Inventory view
 * This is a simple wrapper around the InventoryLayout component
 * to maintain backward compatibility
 */
const InventoryView = () => {
  return <InventoryLayout />;
};

export default InventoryView;
