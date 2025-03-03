
import React, { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

interface StickerFormDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
  title: string;
  description: string;
}

const StickerFormDialog = ({ 
  open, 
  setOpen, 
  trigger, 
  children, 
  title, 
  description 
}: StickerFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default StickerFormDialog;
