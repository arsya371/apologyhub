import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { Sidebar } from "@/ui/components/layout/sidebar";
import { ROUTES } from "@/lib/constants";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(ROUTES.admin.login);
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-4 pt-16 lg:ml-64 lg:p-8 lg:pt-8">{children}</main>
    </div>
  );
}
