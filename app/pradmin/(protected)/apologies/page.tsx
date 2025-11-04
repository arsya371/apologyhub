"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/features/admin/components/data-table";
import { Loading } from "@/ui/components/shared/loading";
import { useRouter } from "next/navigation";
import type { Apology } from "@/features/apologies/types";

export default function ApologiesPage() {
  const router = useRouter();
  const [apologies, setApologies] = useState<Apology[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApologies();
  }, []);

  const fetchApologies = async () => {
    try {
      const response = await fetch("/api/apologies?pageSize=100");
      const data = await response.json();
      setApologies(data.apologies);
    } catch (error) {
      console.error("Failed to fetch apologies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/admin/apologies/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete apology");
    }

    setApologies(apologies.filter((a) => a.id !== id));
    router.refresh();
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Manage Apologies</h1>
        <p className="text-sm text-muted-foreground sm:text-base">View and manage all submitted apologies</p>
      </div>

      <DataTable apologies={apologies} onDelete={handleDelete} />
    </div>
  );
}
