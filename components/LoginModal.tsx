"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoogle: () => void;
  error?: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({ open, onOpenChange, onGoogle, error }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#18181b] border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Access</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Sign in or create your account to continue
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
            onClick={onGoogle}
          >
            <FcGoogle className="w-5 h-5" />
            Access with Google
          </Button>
          {error && (
            <div className="bg-red-900 text-red-300 rounded p-2 text-center text-sm border border-red-700">
              Login failed. Please try again.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
