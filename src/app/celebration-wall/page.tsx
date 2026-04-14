// celebration wall - showcases projects that have been marked as completed
// has a dark hero banner at the top and card grid below
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Trophy,
  Star,
  PartyPopper,
  ExternalLink,
  GitBranch,
  Loader2,
} from "lucide-react";

interface CelebrationProject {
  id: string;
  title: string;
  description: string;
  techStack?: string | null;
  repoUrl?: string | null;
  liveUrl?: string | null;
  completedAt?: string | null;
  user: { id: string; name: string; avatar?: string | null };
  milestones: { id: string; isAchieved: boolean }[];
  _count: { comments: number; collaborations: number };
}

export default function CelebrationWallPage() {
  const [projects, setProjects] = useState<CelebrationProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompleted = async () => {
      try {
        const res = await fetch("/api/projects?completed=true");
        const data = await res.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error("Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompleted();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero banner */}
      <div className="relative bg-black text-white py-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-4 h-4 bg-primary rounded-full animate-bounce" />
          <div className="absolute top-20 right-20 w-3 h-3 bg-green-400 rounded-full animate-bounce delay-100" />
          <div className="absolute bottom-10 left-1/4 w-2 h-2 bg-green-300 rounded-full animate-bounce delay-200" />
          <div className="absolute top-1/2 right-1/3 w-5 h-5 bg-primary/30 rounded-full animate-pulse" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `radial-gradient(circle, #22c55e 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
              <PartyPopper className="w-4 h-4" />
              Celebrating our builders
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Celebration <span className="text-primary">Wall</span>
            </h1>
            <p className="text-white/60 max-w-lg mx-auto">
              These developers took their projects from idea to completion.
              They built in public and shipped it. Respect.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Trophy className="w-16 h-16 text-foreground/10 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">No completed projects yet</h3>
            <p className="text-sm text-foreground/50 mb-4">
              Be the first to complete a project and appear here!
            </p>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              Start a Project
            </Link>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link href={`/projects/${project.id}`}>
                  <div className="relative bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all group">
                    {/* Confetti top bar */}
                    <div className="h-1.5 bg-gradient-to-r from-green-400 via-primary to-green-600" />

                    <div className="p-5">
                      {/* Trophy badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {project.user.name}
                            </p>
                            {project.completedAt && (
                              <p className="text-[10px] text-foreground/40">
                                Shipped{" "}
                                {formatDistanceToNow(
                                  new Date(project.completedAt),
                                  { addSuffix: true }
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex -space-x-1">
                          {[...Array(3)].map((_, j) => (
                            <Star
                              key={j}
                              className="w-4 h-4 text-yellow-400 fill-yellow-400"
                            />
                          ))}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-sm text-foreground/60 line-clamp-2 mb-3">
                        {project.description}
                      </p>

                      {project.techStack && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.techStack
                            .split(",")
                            .slice(0, 4)
                            .map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-0.5 bg-muted rounded text-[10px] font-medium"
                              >
                                {tech.trim()}
                              </span>
                            ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-3 border-t border-border">
                        <span className="text-xs text-foreground/40">
                          {project.milestones.length} milestones
                        </span>
                        <span className="text-xs text-foreground/40">
                          {project._count.comments} comments
                        </span>
                        <div className="ml-auto flex items-center gap-2">
                          {project.repoUrl && (
                            <GitBranch className="w-3.5 h-3.5 text-foreground/30" />
                          )}
                          <ExternalLink className="w-3.5 h-3.5 text-foreground/30 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
