import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { LoginForm } from "@/features/auth/components/login-form";
import { ROUTES } from "@/lib/constants";

export const metadata = {
  title: "Admin Login - I'm Sorry",
  description: "Admin login page",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect(ROUTES.admin.dashboard);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold">I&apos;m Sorry</h1>
          <p className="text-gray-600">Admin Panel</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
