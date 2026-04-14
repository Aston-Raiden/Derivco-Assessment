import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, bio: true, github: true, skills: true } },
        milestones: { orderBy: { createdAt: "asc" } },
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
        },
        collaborations: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        _count: { select: { comments: true, collaborations: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
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
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();

    // If marking as completed, set completedAt
    if (data.stage === "completed" || data.isCompleted) {
      data.isCompleted = true;
      data.completedAt = new Date();
      data.stage = "completed";
    }

    const updated = await prisma.project.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        milestones: true,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ message: "Project deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
