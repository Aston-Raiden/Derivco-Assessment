// reusable card component for displaying projects in the feed and profile
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  HandMetal,
  GitBranch,
  ExternalLink,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    stage: string;
    supportNeeded?: string | null;
    techStack?: string | null;
    repoUrl?: string | null;
    isCompleted: boolean;
    createdAt: string;
    updatedAt: string;
    user: { id: string; name: string; avatar?: string | null };
    milestones: { id: string; isAchieved: boolean }[];
    _count: { comments: number; collaborations: number };
  };
  index?: number;
}

const stageConfig: Record<string, { label: string; className: string }> = {
  idea: { label: "Idea", className: "stage-idea" },
  planning: { label: "Planning", className: "stage-planning" },
  "in-progress": { label: "In Progress", className: "stage-in-progress" },
  testing: { label: "Testing", className: "stage-testing" },
  completed: { label: "Completed", className: "stage-completed" },
};

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const stage = stageConfig[project.stage] || stageConfig.idea;
  const achievedMilestones = project.milestones.filter((m) => m.isAchieved).length;
  const totalMilestones = project.milestones.length;
  const progressPercent =
    totalMilestones > 0 ? (achievedMilestones / totalMilestones) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/projects/${project.id}`}>
        <div className="bg-white rounded-2xl border border-border p-5 hover:border-primary/30 hover:shadow-lg transition-all group cursor-pointer">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {project.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{project.user.name}</p>
                <p className="text-xs text-foreground/40 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(project.updatedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${stage.className}`}
            >
              {stage.label}
            </span>
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold mb-1.5 group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-foreground/60 line-clamp-2 mb-3">
            {project.description}
          </p>

          {/* Tech Stack */}
          {project.techStack && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {project.techStack.split(",").map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 bg-muted rounded-md text-xs text-foreground/60 font-medium"
                >
                  {tech.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Support Needed */}
          {project.supportNeeded && (
            <div className="mb-3 px-3 py-2 bg-accent/50 rounded-xl border border-primary/10">
              <p className="text-xs text-primary font-medium">
                Looking for: {project.supportNeeded}
              </p>
            </div>
          )}

          {/* Milestone progress */}
          {totalMilestones > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-foreground/50">
                  Milestones: {achievedMilestones}/{totalMilestones}
                </span>
                <span className="text-primary font-medium">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-xs text-foreground/50">
                <MessageSquare className="w-3.5 h-3.5" />
                {project._count.comments}
              </span>
              <span className="flex items-center gap-1 text-xs text-foreground/50">
                <HandMetal className="w-3.5 h-3.5" />
                {project._count.collaborations}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {project.repoUrl && (
                <GitBranch className="w-3.5 h-3.5 text-foreground/40" />
              )}
              {project.isCompleted && (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              )}
              <ExternalLink className="w-3.5 h-3.5 text-foreground/30 group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
