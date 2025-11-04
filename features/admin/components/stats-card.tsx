"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

const cardStyles = {
  blue: "bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/30 dark:border-blue-500/40",
  green: "bg-green-500/10 dark:bg-green-500/20 border-green-500/30 dark:border-green-500/40",
  yellow: "bg-yellow-500/10 dark:bg-yellow-500/20 border-yellow-500/30 dark:border-yellow-500/40",
  pink: "bg-pink-500/10 dark:bg-pink-500/20 border-pink-500/30 dark:border-pink-500/40",
};

const iconColors = {
  blue: "text-blue-500",
  green: "text-green-500",
  yellow: "text-yellow-500",
  pink: "text-pink-500",
};

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  gradient?: keyof typeof cardStyles;
  index?: number;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  gradient = "blue",
  index = 0 
}: StatsCardProps) {
  const cardClass = cardStyles[gradient];
  const iconColor = iconColors[gradient];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.2 }
      }}
    >
      <Card className={`${cardClass} border-2 transition-all hover:shadow-lg dark:shadow-none dark:hover:shadow-xl dark:hover:shadow-primary/5`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </CardTitle>
          <motion.div
            whileHover={{ scale: 1.15, rotate: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className={`rounded-lg p-2 ${cardClass}`}
          >
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </motion.div>
        </CardHeader>
        <CardContent className="pb-4">
          <motion.div 
            className="text-3xl font-bold tracking-tight"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1 + 0.2,
              type: "spring",
              stiffness: 200
            }}
          >
            {value.toLocaleString()}
          </motion.div>
          {description && (
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
