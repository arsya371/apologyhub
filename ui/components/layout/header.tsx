"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { ThemeToggle } from "@/ui/components/theme/theme-toggle";
import { motion } from "framer-motion";

interface HeaderProps {
  siteName?: string;
}

export function Header({ siteName = "I'm Sorry" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-white/20 dark:border-gray-700/30">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href={ROUTES.home} className="font-caveat text-2xl font-bold transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
          {siteName}
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link
            href={ROUTES.browse}
            className="text-sm font-medium transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
          >
            Browse
          </Link>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href={ROUTES.submit}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 px-6 py-2 text-sm font-medium text-white shadow-sm transition-all"
            >
              Submit Apology
            </Link>
          </motion.div>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
