
import React, { useEffect } from 'react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newTitle: string) => void;
  currentTitle: string;
  entityType?: string;
}

export function RenameDialog({
  isOpen,
  onClose,
  onRename,
  currentTitle,
  entityType = "mindboard"
}: RenameDialogProps) {
  const [title, setTitle] = useState(currentTitle);

  // Debug logs for component lifecycle and props
  useEffect(() => {
    console.log(`[RenameDialog] Component rendered with props:`, { 
      isOpen, 
      currentTitle, 
      entityType 
    });
  }, [isOpen, currentTitle, entityType]);

  // Reset title when dialog opens with new props
  useEffect(() => {
    if (isOpen) {
      console.log(`[RenameDialog] Dialog opened, setting title to: "${currentTitle}"`);
      setTitle(currentTitle);
    }
  }, [isOpen, currentTitle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`[RenameDialog] Form submitted with title: "${title}"`);
    
    if (title.trim()) {
      console.log(`[RenameDialog] Valid title submitted, calling onRename with: "${title.trim()}"`);
      onRename(title.trim());
    } else {
      console.log(`[RenameDialog] Empty title submitted, not calling onRename`);
    }
  };

  const handleClose = () => {
    console.log(`[RenameDialog] Dialog closing`);
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        console.log(`[RenameDialog] Dialog state changed to: ${open ? 'open' : 'closed'}`);
        if (!open) handleClose();
      }}
    >
      <DialogContent className="bg-background">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename {entityType}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={title}
              onChange={(e) => {
                const newValue = e.target.value;
                console.log(`[RenameDialog] Input changed to: "${newValue}"`);
                setTitle(newValue);
              }}
              placeholder="Enter new title"
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {entityType.startsWith('new') ? 'Create' : 'Rename'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
