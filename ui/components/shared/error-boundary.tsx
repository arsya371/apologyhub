"use client";

import { useEffect } from "react";
import { Button } from "../ui/button";

export function ErrorBoundary({
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
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
      <div className="rounded-lg border-2 border-black bg-red-50 p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="mb-2 text-2xl font-bold">Something went wrong!</h2>
        <p className="mb-4 text-gray-600">
          {error.message || "An unexpected error occurred"}
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
