"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/components/ui/table";
import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { Card } from "@/ui/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/components/ui/alert-dialog";
import { toast } from "sonner";
import { formatRelativeTime, truncateText } from "@/lib/utils";
import { Trash2, Eye, Search } from "lucide-react";
import { motion } from "framer-motion";
import type { Apology } from "@/features/apologies/types";

interface DataTableProps {
  apologies: Apology[];
  onDelete: (id: string) => Promise<void>;
}

export function DataTable({ apologies, onDelete }: DataTableProps) {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredApologies = apologies.filter(
    (apology) =>
      apology.content.toLowerCase().includes(search.toLowerCase()) ||
      apology.toWho?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await onDelete(deleteId);
      toast.success("Apology deleted successfully");
      setDeleteId(null);
    } catch (error) {
      toast.error("Failed to delete apology");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search apologies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-3 lg:hidden">
        {filteredApologies.length === 0 ? (
          <Card className="border-2 bg-card dark:bg-card/50 p-8 text-center">
            <p className="text-muted-foreground">No apologies found</p>
          </Card>
        ) : (
          filteredApologies.map((apology, index) => (
            <motion.div
              key={apology.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="border-2 bg-card dark:bg-card/50 p-4">
                <div className="space-y-3">
                  <p className="font-caveat text-lg leading-relaxed">
                    {truncateText(apology.content, 100)}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">To:</span>
                      <span>{apology.toWho || "-"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      <span className="font-medium">{apology.views}</span>
                    </div>
                    <div>{formatRelativeTime(apology.createdAt)}</div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(apology.id)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden overflow-hidden border-2 bg-card dark:bg-card/50 lg:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApologies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <p className="text-muted-foreground">No apologies found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredApologies.map((apology, index) => (
                  <motion.tr
                    key={apology.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="max-w-md">
                      <p className="font-caveat text-lg">{truncateText(apology.content, 100)}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{apology.toWho || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span className="font-medium">{apology.views}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatRelativeTime(apology.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(apology.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Apology</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this apology? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
