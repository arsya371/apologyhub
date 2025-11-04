import { NextRequest, NextResponse } from "next/server";
import { turnstileVerifySchema } from "@/lib/validations";
import { verifyTurnstileToken } from "@/server/services/turnstile";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = turnstileVerifySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { token } = validation.data;
    const isValid = await verifyTurnstileToken(token);

    return NextResponse.json({ success: isValid });
  } catch (error) {
    console.error("Error verifying turnstile:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
