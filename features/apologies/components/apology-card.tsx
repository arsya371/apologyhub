"use client";

import { truncateText, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import type { Apology } from "../types";
import { motion } from "framer-motion";

interface ApologyCardProps {
  apology: Apology;
}

export function ApologyCard({ apology }: ApologyCardProps) {
  return (
    <Link href={ROUTES.apology(apology.id)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -5 }}
        transition={{ duration: 0.3 }}
        className="group h-full cursor-pointer rounded-2xl backdrop-blur-lg bg-white/60 dark:bg-gray-800/60 border border-white/20 dark:border-gray-700/30 p-6 shadow-xl hover:shadow-2xl transition-shadow"
      >
        <div className="mb-4">
          <p className="mb-2 text-xl text-gray-500 dark:text-gray-400">
            hello <span className="font-caveat text-3xl font-medium text-black dark:text-white">{apology.toWho || "someone"}</span>
          </p>
          <p className="text-xl text-gray-500 dark:text-gray-400">
            i&apos;m sorry, <span className="font-caveat text-3xl leading-relaxed text-gray-900 dark:text-white">{truncateText(apology.content, 38)}</span>
          </p>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
          <p className="font-caveat text-lg italic text-gray-400 dark:text-gray-500">{apology.fromWho || "anonymous"}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">{formatRelativeTime(apology.createdAt)}</p>
        </div>
      </motion.div>
    </Link>
  );
}
