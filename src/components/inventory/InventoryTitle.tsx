
interface InventoryTitleProps {
  activeTab: "all" | "owned" | "needed" | "duplicates";
}

const InventoryTitle = ({ activeTab }: InventoryTitleProps) => {
  return (
    <div className="flex justify-between items-center py-0.5">
      <h2 className="text-sm font-semibold text-foreground">
        {activeTab === "all" && "כל המדבקות"}
        {activeTab === "owned" && "מדבקות ברשותי"}
        {activeTab === "needed" && "מדבקות חסרות"}
        {activeTab === "duplicates" && "מדבקות כפולות"}
      </h2>
    </div>
  );
};

export default InventoryTitle;
