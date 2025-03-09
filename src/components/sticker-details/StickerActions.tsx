
import React from 'react';
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
}

const StickerActions = ({ 
  sticker, 
  onToggleOwned, 
  onToggleDuplicate, 
  onEdit,
  onDelete,
  isDeleting = false
}: StickerActionsProps) => {
  return (
    <div className="flex flex-wrap gap-2 my-2">
      <Button
        variant={sticker.isOwned ? "destructive" : "default"}
        size="sm"
        onClick={onToggleOwned}
        className="flex-1"
      >
        {sticker.isOwned ? (
          <>
            <XCircle className="h-4 w-4 mr-1" /> סמן כחסר
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-1" /> סמן כנאסף
          </>
        )}
      </Button>

      {sticker.isOwned && (
        <Button
          variant={sticker.isDuplicate ? "outline" : "secondary"}
          size="sm"
          onClick={onToggleDuplicate}
          className="flex-1"
        >
          {sticker.isDuplicate ? "סמן כיחיד" : "סמן ככפול"}
        </Button>
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onEdit}
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
                disabled={isDeleting}
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
