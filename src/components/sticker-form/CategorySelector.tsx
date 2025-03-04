
import React from "react";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface CategorySelectorProps {
  category: string;
  setCategory: (value: string) => void;
}

const CategorySelector = ({ category, setCategory }: CategorySelectorProps) => {
  const categories = ["הכל"]; // Simplified to only include "All"
  
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="category" className="text-right">
        קטגוריה
      </Label>
      <Select
        value={category}
        onValueChange={setCategory}
      >
        <SelectTrigger className="col-span-3">
          <SelectValue placeholder="בחר קטגוריה" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategorySelector;
