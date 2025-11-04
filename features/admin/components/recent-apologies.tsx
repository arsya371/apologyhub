"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/components/ui/card";
import { Badge } from "@/ui/components/ui/badge";
import { Eye, MessageSquare } from "lucide-react";
import { formatRelativeTime, truncateText } from "@/lib/utils";
import { motion } from "framer-motion";

interface Apology {
  id: string;
  content: string;
  toWho: string | null;
  createdAt: Date;
  views: number;
}

interface RecentApologiesProps {
  apologies: Apology[];
}

export function RecentApologies({ apologies }: RecentApologiesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="border-2 bg-card dark:bg-card/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Recent Apologies</CardTitle>
              <CardDescription className="text-xs">Latest submissions to your platform</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {apologies.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No apologies yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  New submissions will appear here
                </p>
              </motion.div>
            ) : (
              apologies.map((apology, index) => (
                <motion.div
                  key={apology.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: 0.6 + index * 0.05,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  whileHover={{ 
                    x: 4,
                    transition: { duration: 0.2 }
                  }}
                  className="group relative overflow-hidden rounded-lg border-2 bg-muted/20 dark:bg-muted/10 p-4 transition-all hover:bg-muted/30 dark:hover:bg-muted/20 hover:shadow-sm hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <p className="font-caveat text-base leading-relaxed text-foreground">
                        {truncateText(apology.content, 150)}
                      </p>
                      {apology.toWho && (
                        <Badge variant="secondary" className="text-xs font-normal">
                          To: {apology.toWho}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
                      <span className="whitespace-nowrap font-medium">
                        {formatRelativeTime(apology.createdAt)}
                      </span>
                      <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1">
                        <Eye className="h-3 w-3" />
                        <span className="font-semibold tabular-nums">{apology.views}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover indicator */}
                  <div className="absolute left-0 top-0 h-full w-1 bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
