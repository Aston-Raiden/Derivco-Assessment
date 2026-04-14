// GET /api/projects - list projects with filters + pagination
// POST /api/projects - create a new project (requires auth)
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const stage = searchParams.get("stage");
    const userId = searchParams.get("userId");
    const completed = searchParams.get("completed");

    const where: Record<string, unknown> = {};
    if (stage) where.stage = stage;
    if (userId) where.userId = userId;
    if (completed === "true") where.isCompleted = true;

    // run both queries in parallel for better performance
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          milestones: { orderBy: { createdAt: "desc" } },
          comments: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
            orderBy: { createdAt: "desc" },
            take: 3,
          },
          collaborations: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
          },
          _count: { select: { comments: true, collaborations: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({ projects, total, page, limit });
  } catch {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, stage, supportNeeded, techStack, repoUrl, liveUrl } =
      await req.json();

    if (!title || !description || !stage) {
      return NextResponse.json(
        { error: "Title, description, and stage are required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        stage,
        supportNeeded,
        techStack,
        repoUrl,
        liveUrl,
        userId: session.user.id,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
