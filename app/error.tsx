"use client";

import { useEffect } from "react";
import { Button } from "@/ui/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="text-center">
        <div className="mb-8 inline-block rounded-lg border-4 border-black bg-red-100 px-8 py-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-6xl font-bold">Error</h1>
        </div>
        <h2 className="mb-4 text-3xl font-bold">Something went wrong!</h2>
        <p className="mb-8 text-gray-600">
          {error.message || "An unexpected error occurred"}
        </p>
        <Button onClick={reset} size="lg">
          Try Again
        </Button>
      </div>
    </div>
  );
}
