"use client";

import Link from "next/link";
import { Button } from "@/ui/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [displayedText, setDisplayedText] = useState("");
  const [displayedRecipient, setDisplayedRecipient] = useState("");
  const fullText = "being late to our coffee date";
  const fullRecipient = "Sarah";
  
  useEffect(() => {
    let recipientIndex = 0;
    const recipientInterval = setInterval(() => {
      if (recipientIndex <= fullRecipient.length) {
        setDisplayedRecipient(fullRecipient.slice(0, recipientIndex));
        recipientIndex++;
      } else {
        clearInterval(recipientInterval);
        // Start typing the message after recipient is done
        let textIndex = 0;
        const textInterval = setInterval(() => {
          if (textIndex <= fullText.length) {
            setDisplayedText(fullText.slice(0, textIndex));
            textIndex++;
          } else {
            clearInterval(textInterval);
          }
        }, 50);
      }
    }, 100);
    
    return () => clearInterval(recipientInterval);
  }, []);

  return (
    <div className="container px-4 py-16">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto mb-16 max-w-3xl text-center"
      >
        <h1 className="font-caveat mb-6 text-6xl font-medium text-black dark:text-white bg-clip-text text-transparent md:text-7xl">
          hello, i&apos;m sorry
        </h1>
        <p className="mb-10 text-lg text-gray-700 dark:text-gray-300">
          for everything that you can&apos;t say, let your apology, your gratitude, your love speak through your message
        </p>
        <div className="flex items-center justify-center gap-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href={ROUTES.submit}>
              <Button size="lg" className="rounded-lg bg-blue-600 hover:bg-blue-700 px-8 py-3 font-semibold text-white">
                Submit
              </Button>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href={ROUTES.browse}>
              <Button size="lg" variant="ghost" className="rounded-lg px-8 py-3 font-semibold">
                Browse
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Example Apology Card */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mx-auto max-w-2xl"
      >
        <div className="rounded-2xl backdrop-blur-lg bg-white/60 dark:bg-gray-800/60 border border-white/20 dark:border-gray-700/30 p-6 shadow-xl">
          <div className="mb-4">
            <p className="mb-2 text-xl text-gray-500 dark:text-gray-400">
              hello <span className="font-caveat text-3xl font-medium text-black dark:text-white">
                {displayedRecipient}
                {displayedRecipient.length < fullRecipient.length && <span className="animate-pulse">|</span>}
              </span>
            </p>
            <p className="text-xl text-gray-500 dark:text-gray-400">
              i&apos;m sorry, <span className="font-caveat text-3xl leading-relaxed text-gray-900 dark:text-white">
                {displayedText}
                {displayedText.length < fullText.length && displayedRecipient.length === fullRecipient.length && <span className="animate-pulse">|</span>}
              </span>
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
            <p className="font-caveat text-lg italic text-gray-400 dark:text-gray-500">John</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">just now</p>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
