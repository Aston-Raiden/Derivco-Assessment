// seed script - populates the database with demo users and SA-themed projects
// run with: npx tsx prisma/seed.ts
import "dotenv/config";
import { hash } from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

async function main() {
  const { PrismaClient } = await import("../src/generated/prisma/client.js");
  const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3");

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const dbPath = path.join(__dirname, "dev.db");
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  const prisma = new PrismaClient({ adapter });

  console.log("Seeding database...");

  const password = await hash("demo123", 12);

  const user1 = await prisma.user.upsert({
    where: { email: "thabo@mzansibuilds.dev" },
    update: {},
    create: {
      name: "Thabo Mokoena",
      email: "thabo@mzansibuilds.dev",
      password,
      bio: "Full-stack developer passionate about building tools for African developers.",
      github: "thabodev",
      skills: JSON.stringify(["React", "Node.js", "TypeScript", "PostgreSQL"]),
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "naledi@mzansibuilds.dev" },
    update: {},
    create: {
      name: "Naledi Khumalo",
      email: "naledi@mzansibuilds.dev",
      password,
      bio: "Mobile developer building fintech solutions for South Africa.",
      github: "naledidev",
      skills: JSON.stringify(["React Native", "Flutter", "Dart", "Firebase"]),
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "sipho@mzansibuilds.dev" },
    update: {},
    create: {
      name: "Sipho Dlamini",
      email: "sipho@mzansibuilds.dev",
      password,
      bio: "DevOps engineer turning ideas into scalable systems.",
      github: "siphodev",
      skills: JSON.stringify(["Docker", "Kubernetes", "AWS", "Python"]),
    },
  });

  const project1 = await prisma.project.create({
    data: {
      title: "TaxiTrack - SA Minibus Taxi Tracker",
      description:
        "A real-time tracking app for minibus taxis in South Africa. Helping commuters know exactly when their taxi will arrive using GPS and crowdsourced data.",
      stage: "in-progress",
      supportNeeded: "UI/UX design, Mobile testing on low-end devices",
      techStack: "React Native, Node.js, MongoDB, Socket.io",
      repoUrl: "https://github.com/thabodev/taxitrack",
      userId: user1.id,
    },
  });

  await prisma.milestone.createMany({
    data: [
      { title: "Project setup and architecture", isAchieved: true, achievedAt: new Date("2026-03-01"), projectId: project1.id },
      { title: "GPS tracking module", isAchieved: true, achievedAt: new Date("2026-03-15"), projectId: project1.id },
      { title: "Real-time updates with Socket.io", isAchieved: true, achievedAt: new Date("2026-03-28"), projectId: project1.id },
      { title: "User interface for commuters", isAchieved: false, projectId: project1.id },
      { title: "Beta testing with taxi drivers", isAchieved: false, projectId: project1.id },
    ],
  });

  const project2 = await prisma.project.create({
    data: {
      title: "LoadShedding Buddy",
      description:
        "Never be caught off guard by load shedding again. Smart notifications, schedule management, and energy-saving tips for South African households.",
      stage: "completed",
      isCompleted: true,
      completedAt: new Date("2026-04-01"),
      techStack: "Next.js, Tailwind CSS, Supabase, PWA",
      repoUrl: "https://github.com/naledidev/loadshedding-buddy",
      liveUrl: "https://loadshedding-buddy.vercel.app",
      userId: user2.id,
    },
  });

  await prisma.milestone.createMany({
    data: [
      { title: "Eskom API integration", isAchieved: true, achievedAt: new Date("2026-02-10"), projectId: project2.id },
      { title: "Push notification system", isAchieved: true, achievedAt: new Date("2026-02-25"), projectId: project2.id },
      { title: "PWA setup for offline access", isAchieved: true, achievedAt: new Date("2026-03-10"), projectId: project2.id },
      { title: "Community energy tips feature", isAchieved: true, achievedAt: new Date("2026-03-25"), projectId: project2.id },
    ],
  });

  const project3 = await prisma.project.create({
    data: {
      title: "Ubuntu CI/CD Pipeline Builder",
      description:
        "A visual CI/CD pipeline builder that generates GitHub Actions workflows. Drag-and-drop interface for developers who want to set up DevOps without the YAML headache.",
      stage: "planning",
      supportNeeded: "Frontend developer for drag-and-drop interface",
      techStack: "Vue.js, Go, Docker, GitHub API",
      userId: user3.id,
    },
  });

  await prisma.milestone.createMany({
    data: [
      { title: "Architecture design document", isAchieved: true, achievedAt: new Date("2026-04-05"), projectId: project3.id },
      { title: "Backend API for pipeline configs", isAchieved: false, projectId: project3.id },
      { title: "Visual pipeline builder UI", isAchieved: false, projectId: project3.id },
    ],
  });

  await prisma.comment.createMany({
    data: [
      { content: "This is amazing! I commute by taxi every day and would love this.", userId: user2.id, projectId: project1.id },
      { content: "Have you considered working with the taxi associations?", userId: user3.id, projectId: project1.id },
      { content: "I've been using this and it's a lifesaver during stage 6!", userId: user1.id, projectId: project2.id },
      { content: "Great idea! I'd love to help with the frontend.", userId: user1.id, projectId: project3.id },
    ],
  });

  await prisma.collaborationRequest.create({
    data: {
      message: "I'd love to help test this on my daily commute from Soweto!",
      userId: user2.id,
      projectId: project1.id,
    },
  });

  await prisma.collaborationRequest.create({
    data: {
      message: "I can help with the drag-and-drop UI using Vue.js.",
      status: "accepted",
      userId: user1.id,
      projectId: project3.id,
    },
  });

  console.log("Database seeded successfully!");
  console.log("Created 3 users, 3 projects with milestones, comments, and collaborations.");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
