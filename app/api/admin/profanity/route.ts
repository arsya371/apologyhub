import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { prisma } from "@/server/db/client";
import { refreshProfanityCache } from "@/server/services/moderation";
import { z } from "zod";

const profanityWordSchema = z.object({
  word: z.string().min(1),
  language: z.enum(["en", "id"]),
  severity: z.enum(["low", "medium", "high"]).optional(),
});

// GET - List all profanity words
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") !== "false";
    const language = searchParams.get("language") || undefined;

    const words = await prisma.profanityWord.findMany({
      where: {
        ...(activeOnly && { isActive: true }),
        ...(language && { language }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(words);
  } catch (error) {
    console.error("Error fetching profanity words:", error);
    return NextResponse.json(
      { error: "Failed to fetch profanity words" },
      { status: 500 }
    );
  }
}

// POST - Add a profanity word
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = profanityWordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { word, language, severity } = validation.data;

    // Check if word already exists
    const existing = await prisma.profanityWord.findUnique({
      where: { word },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Word already exists" },
        { status: 409 }
      );
    }

    const profanityWord = await prisma.profanityWord.create({
      data: {
        word,
        language,
        severity: severity || "medium",
        addedBy: session.user?.email || "admin",
        isActive: true,
      },
    });

    // Refresh cache
    refreshProfanityCache();

    return NextResponse.json(profanityWord, { status: 201 });
  } catch (error) {
    console.error("Error adding profanity word:", error);
    return NextResponse.json(
      { error: "Failed to add profanity word" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a profanity word
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Word ID is required" },
        { status: 400 }
      );
    }

    const result = await prisma.profanityWord.update({
      where: { id },
      data: { isActive: false },
    });

    // Refresh cache
    refreshProfanityCache();

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error removing profanity word:", error);
    return NextResponse.json(
      { error: "Failed to remove profanity word" },
      { status: 500 }
    );
  }
}
