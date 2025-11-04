import Link from "next/link";
import { Button } from "@/ui/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="text-center">
        <div className="mb-8 inline-block rounded-lg border-4 border-black bg-yellow-300 px-8 py-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-6xl font-bold">404</h1>
        </div>
        <h2 className="mb-4 text-3xl font-bold">Page Not Found</h2>
        <p className="mb-8 text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href={ROUTES.home}>
          <Button size="lg" variant="secondary">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
