"use client";
import * as React from "react";
import { 
  // Custom message depending on intent, 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UsernameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (username: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  message?: string;
}

export const UsernameModal: React.FC<UsernameModalProps> = ({ open, onOpenChange, onSave, loading, error, message }) => {
  const [username, setUsername] = React.useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSave(username.trim());
    }
  };

  React.useEffect(() => {
    if (!open) setUsername("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-[#18181b] border-zinc-800 text-white" forceMount onInteractOutside={e => e.preventDefault()}>
        <DialogHeader className="[&>button[data-radix-dialog-close]]:hidden">
          <DialogTitle className="text-2xl font-bold">Choose your username</DialogTitle>
          <DialogDescription className="text-zinc-400">
            This name will be visible to others.
          </DialogDescription>
        </DialogHeader>
        {message && (
          <div className="mb-2 text-blue-300 text-sm text-center font-medium">
            {message}
          </div>
        )}
        <form className="flex flex-col gap-4 mt-4" onSubmit={handleSave}>
          <Input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter your username"
            maxLength={32}
            required
            disabled={loading}
            className="bg-zinc-900 border-zinc-700 text-white"
          />
          {error && (
            <div className="bg-red-900 text-red-300 rounded p-2 text-center text-sm border border-red-700">
              {error}
            </div>
          )}
          <Button type="submit" disabled={loading || !username.trim()} className="w-full bg-blue-600 text-white hover:bg-blue-700">
            {loading ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UsernameModal;
