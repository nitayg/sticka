import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, Edit, Trash } from "lucide-react";
import { ExchangeOffer } from "@/lib/types";

interface ExchangeActionsProps {
  exchange: ExchangeOffer;
  onRefresh: () => void;
  isOwner?: boolean;
  onUpdate?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
}

const ExchangeActions = ({ 
  exchange, 
  onRefresh, 
  isOwner,
  onUpdate,
  onDelete,
  onComplete
}: ExchangeActionsProps) => {
  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  if (exchange.status === "completed") {
    return (
      <div className="mt-4 flex justify-center">
        <span className="text-sm font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full">
          העסקה הושלמה
        </span>
      </div>
    );
  }

  return (
    <div className="mt-4 flex space-x-2 rtl:space-x-reverse">
      {isOwner && (
        <>
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={handleUpdate}
          >
            <Edit className="h-4 w-4 mr-1" />
            עדכן עסקה
          </Button>
          
          {exchange.status === "active" && (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={handleComplete}
            >
              <Check className="h-4 w-4 mr-1" />
              השלם עסקה
            </Button>
          )}
          
          <Button
            variant="destructive"
            size="sm"
            className="w-10"
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </>
      )}
      
      {!isOwner && (
        <Button
          variant="default"
          size="sm"
          className="flex-1"
          onClick={() => {
            console.log("Responding to exchange offer:", exchange.id);
            // Implement response functionality
          }}
        >
          הגב להצעה
        </Button>
      )}
    </div>
  );
};

export default ExchangeActions;
