"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { Textarea } from "@/ui/components/ui/textarea";
import { toast } from "sonner";
import { Turnstile } from "@/ui/components/shared/turnstile";
import { APOLOGY_CONSTRAINTS, ROUTES } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ApologyFormWithTurnstileProps {
  maxLength?: number;
}

export function ApologyFormWithTurnstile({
  maxLength = APOLOGY_CONSTRAINTS.maxLength,
}: ApologyFormWithTurnstileProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [toWho, setToWho] = useState("");
  const [fromWho, setFromWho] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (content.length < APOLOGY_CONSTRAINTS.minLength) {
      toast.error(`Apology must be at least ${APOLOGY_CONSTRAINTS.minLength} characters`);
      return;
    }

    if (!turnstileToken) {
      toast.error("Please complete the verification");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/apologies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          toWho: toWho || null,
          fromWho: fromWho || null,
          turnstileToken,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit apology");
      }

      const data = await response.json();

      toast.success("Your apology has been submitted");

      router.push(ROUTES.apology(data.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit apology");
      setTurnstileToken("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingChars = maxLength - content.length;
  const currentDate = new Intl.DateTimeFormat('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date());

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Preview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl backdrop-blur-lg bg-white/60 dark:bg-gray-800/60 border border-white/20 dark:border-gray-700/30 p-6 shadow-xl"
      >
        <div className="mb-4">
          <p className="mb-1 text-xl text-gray-500 dark:text-gray-400">
            hello{" "}
            <span className="font-caveat text-3xl font-medium text-black dark:text-white">
              {toWho || "your recipient"}
            </span>
          </p>
          <p className="text-xl text-gray-500 dark:text-gray-400">
            i&apos;m sorry,{" "}
            <span className="font-caveat text-3xl leading-relaxed text-gray-900 dark:text-white">
              {content || "your message"}
            </span>
          </p>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
          <p className="font-caveat text-xl italic text-gray-400 dark:text-gray-500">{fromWho || "your name"}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">{currentDate}</p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl backdrop-blur-lg bg-white/60 dark:bg-gray-800/60 border border-white/20 dark:border-gray-700/30 p-6 shadow-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="toWho"
              placeholder="Recipient's name"
              value={toWho}
              onChange={(e) => setToWho(e.target.value)}
              maxLength={APOLOGY_CONSTRAINTS.toWhoMaxLength}
              className="rounded-xl backdrop-blur-lg text-black dark:text-white bg-white dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600/30 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Textarea
              id="content"
              placeholder="Your apology message, max 140 characters"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={maxLength}
              rows={6}
              required
              className="font-caveat text-base rounded-xl backdrop-blur-lg text-black dark:text-white bg-white dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600/30 focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              {remainingChars} characters remaining
            </p>
          </div>

          <div className="space-y-2">
            <Input
              id="fromWho"
              placeholder="Your name"
              value={fromWho}
              onChange={(e) => setFromWho(e.target.value)}
              maxLength={APOLOGY_CONSTRAINTS.toWhoMaxLength}
              className="rounded-xl backdrop-blur-lg text-black dark:text-white bg-white dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600/30 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {siteKey && (
            <div className="flex justify-center">
              <Turnstile
                siteKey={siteKey}
                onVerify={(token) => setTurnstileToken(token)}
                onError={() => setTurnstileToken("")}
                onExpire={() => setTurnstileToken("")}
              />
            </div>
          )}

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="submit" size="lg" className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold text-white" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
