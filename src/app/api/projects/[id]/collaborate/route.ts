// collaboration / "raise hand" feature
// POST - request to collaborate (prevents duplicates)
// PATCH - project owner accepts or declines a request
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { message } = await req.json();

    // Check if already requested
    const existing = await prisma.collaborationRequest.findFirst({
      where: { userId: session.user.id, projectId: id },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already raised your hand for this project" },
        { status: 409 }
      );
    }

    const collab = await prisma.collaborationRequest.create({
      data: {
        message,
        userId: session.user.id,
        projectId: id,
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    return NextResponse.json(collab, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit collaboration request" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Only the project owner can manage requests" }, { status: 403 });
    }

    const { collaborationId, status } = await req.json();
    if (!["accepted", "declined"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.collaborationRequest.update({
      where: { id: collaborationId },
      data: { status },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update collaboration request" },
      { status: 500 }
    );
  }
}
