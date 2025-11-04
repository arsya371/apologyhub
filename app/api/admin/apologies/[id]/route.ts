import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { apologyUpdateSchema } from "@/lib/validations";
import { updateApology, deleteApology } from "@/server/mutations/apologies";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validation = apologyUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    const apology = await updateApology(id, validation.data);

    return NextResponse.json(apology);
  } catch (error) {
    console.error("Error updating apology:", error);
    return NextResponse.json(
      { error: "Failed to update apology" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await deleteApology(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting apology:", error);
    return NextResponse.json(
      { error: "Failed to delete apology" },
      { status: 500 }
    );
  }
}
