import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FacebookImportsDialogProps {
  open: boolean;
  selectedCount: number;
  onCancel: () => void;
  onConfirm: () => void;
  setOpen: (open: boolean) => void;
}

export const FacebookImportsDialog: React.FC<FacebookImportsDialogProps> = ({
  open,
  selectedCount,
  onCancel,
  onConfirm,
  setOpen,
}) => (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirm Extraction</DialogTitle>
      </DialogHeader>
      <p className="text-gray-700">
        Are you sure you want to extract listings from the {selectedCount}{" "}
        selected posts? The remaining posts in your Facebook imports will be
        deleted.
      </p>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onConfirm}>Extract Selected</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
