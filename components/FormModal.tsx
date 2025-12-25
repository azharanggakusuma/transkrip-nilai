"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FormModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  title: string;
  description?: string;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  maxWidth?: string; // misal: "sm:max-w-[600px]"
}

export function FormModal({
  isOpen,
  onClose,
  title,
  description,
  onSubmit,
  children,
  submitLabel = "Simpan Data",
  cancelLabel = "Batal",
  maxWidth = "sm:max-w-[500px]",
}: FormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={maxWidth}>
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        
        <form onSubmit={onSubmit}>
          {/* AREA FORM INPUT (CHILDREN) */}
          <div className="grid gap-5 py-4">
            {children}
          </div>

          <DialogFooter className="mt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onClose(false)}
            >
              {cancelLabel}
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}