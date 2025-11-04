"use client";

import { formatRelativeTime } from "@/lib/utils";
import type { Apology } from "../types";
import { motion } from "framer-motion";

interface ApologyDetailProps {
  apology: Apology;
}

export function ApologyDetail({ apology }: ApologyDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-3xl rounded-2xl backdrop-blur-lg bg-white/60 dark:bg-gray-800/60 border border-white/20 dark:border-gray-700/30 p-8 shadow-2xl"
    >
      <div className="mb-6">
        <p className="mb-4 text-xl text-gray-500 dark:text-gray-400">
          hello <span className="font-caveat text-4xl font-medium text-black dark:text-white">{apology.toWho || "someone"}</span>
        </p>
        <p className="text-xl text-gray-500 dark:text-gray-400">
          i&apos;m sorry, <span className="font-caveat text-4xl leading-relaxed text-gray-900 dark:text-white">{apology.content}</span>
        </p>
      </div>
      <div className="flex items-center justify-between border-t border-gray-200/50 dark:border-gray-700/50 pt-6">
        <p className="font-caveat text-xl italic text-gray-400 dark:text-gray-500">{apology.fromWho || "anonymous"}</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">{formatRelativeTime(apology.createdAt)}</p>
      </div>
    </motion.div>
  );
}
