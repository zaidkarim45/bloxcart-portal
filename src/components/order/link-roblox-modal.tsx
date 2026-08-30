"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Loader2, Search } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { findUserByUsername } from "@/lib/roblox/client";
import type { RobloxLookupError, RobloxProfile } from "@/lib/roblox/types";

type Step = "search" | "loading" | "confirm" | "error";

const ERROR_COPY: Record<RobloxLookupError, string> = {
  not_found: "We couldn't find a Roblox account with that username. Please check the spelling and try again.",
  unavailable: "We couldn't reach Roblox right now. Please try searching again in a moment.",
  timeout: "That took longer than expected. Please try again.",
};

export function LinkRobloxModal({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (profile: RobloxProfile) => void;
}) {
  const [step, setStep] = useState<Step>("search");
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState<RobloxProfile | null>(null);
  const [error, setError] = useState<RobloxLookupError | null>(null);

  function reset() {
    setStep("search");
    setUsername("");
    setProfile(null);
    setError(null);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    setStep("loading");
    const result = await findUserByUsername(username);
    if (result.ok) {
      setProfile(result.profile);
      setStep("confirm");
    } else {
      setError(result.error);
      setStep("error");
    }
  }

  function handleConfirm() {
    if (!profile) return;
    onConfirm(profile);
    onOpenChange(false);
    reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent>
        <AnimatePresence mode="wait">
          {step === "search" || step === "loading" ? (
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <DialogHeader>
                <DialogTitle>Link your Roblox account</DialogTitle>
                <DialogDescription>
                  Enter the Roblox username you want your items delivered to.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSearch} className="flex flex-col gap-3">
                <Input
                  autoFocus
                  placeholder="Roblox username"
                  value={username}
                  disabled={step === "loading"}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Button type="submit" disabled={step === "loading" || !username.trim()}>
                  {step === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Finding your Roblox account…
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Find Account
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          ) : step === "confirm" && profile ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <DialogHeader>
                <DialogTitle>Is this you?</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <Avatar src={profile.avatarUrl} name={profile.displayName} size="xl" />
                <div>
                  <p className="text-base font-semibold text-foreground">{profile.displayName}</p>
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                </div>
              </div>
              <div className="mt-2 flex flex-col gap-2">
                <Button onClick={handleConfirm}>Yes, link this account</Button>
                <Button variant="ghost" onClick={reset}>
                  Search again
                </Button>
              </div>
            </motion.div>
          ) : step === "error" && error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <DialogHeader>
                <DialogTitle>We couldn&apos;t find that account</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/15 text-danger">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground">{ERROR_COPY[error]}</p>
              </div>
              <Button className="w-full" onClick={reset}>
                Try again
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
