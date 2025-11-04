import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/pradmin/login",
    },
  }
);

export const config = {
  matcher: [
    "/pradmin/dashboard/:path*",
    "/pradmin/apologies/:path*",
    "/pradmin/settings/:path*",
    "/api/admin/:path*",
  ],
};
