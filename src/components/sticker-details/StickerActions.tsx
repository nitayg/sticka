
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Trash, CheckCircle, XCircle } from "lucide-react";
import { Sticker } from "@/lib/types";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { TooltipProvider } from "@radix-ui/react-tooltip";

interface StickerActionsProps {
  sticker: Sticker;
  onToggleOwned: () => void;
  onToggleDuplicate: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  isLoading?: boolean;
}

const StickerActions = ({ 
  sticker, 
  onToggleOwned, 
  onToggleDuplicate, 
  onEdit,
  onDelete,
  isDeleting = false,
  isLoading = false
}: StickerActionsProps) => {
  // Local state for optimistic UI updates
  const [localIsOwned, setLocalIsOwned] = useState(sticker.isOwned);
  const [localIsDuplicate, setLocalIsDuplicate] = useState(sticker.isDuplicate);
  
  // Update local state when sticker props change
  useEffect(() => {
    setLocalIsOwned(sticker.isOwned);
    setLocalIsDuplicate(sticker.isDuplicate);
  }, [sticker.isOwned, sticker.isDuplicate]);

  const handleToggleOwned = () => {
    setLocalIsOwned(!localIsOwned);
    onToggleOwned();
  };

  const handleToggleDuplicate = () => {
    setLocalIsDuplicate(!localIsDuplicate);
    onToggleDuplicate();
  };

  return (
    <div className="flex flex-wrap gap-2 my-2">
      <Button
        variant={localIsOwned ? "destructive" : "default"}
        size="sm"
        onClick={handleToggleOwned}
        className="flex-1"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : localIsOwned ? (
          <>
            <XCircle className="h-4 w-4 mr-1" /> סמן כחסר
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-1" /> סמן כנאסף
          </>
        )}
      </Button>

      {localIsOwned && (
        <Button
          variant={localIsDuplicate ? "outline" : "secondary"}
          size="sm"
          onClick={handleToggleDuplicate}
          className="flex-1"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : localIsDuplicate ? (
            "סמן כיחיד"
          ) : (
            "סמן ככפול"
          )}
        </Button>
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onEdit}
              disabled={isLoading}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>ערוך מדבקה</p>
          </TooltipContent>
        </Tooltip>

        {onDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                onClick={onDelete}
                disabled={isDeleting || isLoading}
              >
                {isDeleting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Trash className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>מחק מדבקה</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
};

export default StickerActions;
