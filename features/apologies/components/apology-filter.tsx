"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/ui/components/ui/input";
import { Button } from "@/ui/components/ui/button";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export function ApologyFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    
    router.push(`?${params.toString()}`);
  };

  return (
    <motion.form 
      onSubmit={handleSearch} 
      className="flex gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Input
        type="text"
        placeholder="Search by recipient name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 rounded-xl backdrop-blur-lg text-black dark:text-white bg-white dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600/30 focus:ring-2 focus:ring-blue-500"
      />
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button type="submit" className="rounded-lg bg-blue-600 hover:bg-blue-700 px-6 font-medium text-white">
          <Search className="h-4 w-4" />
        </Button>
      </motion.div>
    </motion.form>
  );
}
