"use client";

import { memo } from "react";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";

/**
 * ValidationDialog - Dialog shown when benefit counts don't match across languages
 */
interface ValidationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  benefitCounts: Array<{ language: string; count: number }>;
}

export const ValidationDialog = memo(({
  isOpen,
  onOpenChange,
  benefitCounts
}: ValidationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Benefit Count Mismatch</DialogTitle>
          <DialogDescription>
            <div className="mt-4 mb-4">
              Each language must have the same number of benefits before saving. Please add or remove benefits to
              ensure all languages have the same count:
            </div>
            <ul className="list-disc pl-6 space-y-1">
              {benefitCounts?.map(({ language, count }) => (
                <li key={language}>
                  <span className="font-semibold uppercase">{language}</span>: {count} benefits
                </li>
              ))}
            </ul>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

ValidationDialog.displayName = "ValidationDialog";