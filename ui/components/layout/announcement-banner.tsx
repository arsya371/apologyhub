"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface AnnouncementBannerProps {
  message: string;
}

// Parse markdown-style links [text](url) and convert to React elements
function parseMarkdownLinks(text: string) {
  const parts: (string | JSX.Element)[] = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add the link
    const linkText = match[1];
    const url = match[2];
    const isExternal = url.startsWith('http://') || url.startsWith('https://');

    parts.push(
      isExternal ? (
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white/90 font-semibold"
        >
          {linkText}
        </a>
      ) : (
        <Link
          key={key++}
          href={url}
          className="underline hover:text-white/90 font-semibold"
        >
          {linkText}
        </Link>
      )
    );

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export function AnnouncementBanner({ message }: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !message) return null;

  const parsedMessage = parseMarkdownLinks(message);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <svg
                className="h-5 w-5 flex-shrink-0 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-medium text-white md:text-base">
                {parsedMessage}
              </p>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="flex-shrink-0 rounded-lg p-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close announcement"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
