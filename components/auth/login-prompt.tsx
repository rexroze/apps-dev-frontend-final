"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

export default function LoginPrompt({ open, onOpenChange, message }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in required</DialogTitle>
          <DialogDescription>{message ?? "You need to sign in to complete checkout."}</DialogDescription>
        </DialogHeader>

        <div className="mt-4" />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Link href="/login" className="ml-2">
            <Button>Go to Login</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
