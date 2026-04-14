// live feed page - polls every 15s for new projects, supports filtering by stage
"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectCard from "@/components/ProjectCard";
import {
  Loader2,
  RefreshCw,
  Filter,
  Rss,
} from "lucide-react";

interface Project {
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
}

const stages = [
  { value: "", label: "All Stages" },
  { value: "idea", label: "Idea" },
  { value: "planning", label: "Planning" },
  { value: "in-progress", label: "In Progress" },
  { value: "testing", label: "Testing" },
  { value: "completed", label: "Completed" },
];

export default function FeedPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchProjects = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (stageFilter) params.set("stage", stageFilter);
      const res = await fetch(`/api/projects?${params.toString()}`);
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [stageFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Live feed: auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchProjects(), 15000);
    return () => clearInterval(interval);
  }, [fetchProjects]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Rss className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold">Live Feed</h1>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-green" />
          </div>
          <p className="text-sm text-foreground/50">
            See what developers in the community are building
          </p>
        </div>
        <button
          onClick={() => fetchProjects(true)}
          disabled={refreshing}
          className="p-2 rounded-xl border border-border hover:border-primary/30 hover:bg-accent transition-all disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin text-primary" : "text-foreground/50"}`}
          />
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-foreground/40 flex-shrink-0" />
        {stages.map((s) => (
          <button
            key={s.value}
            onClick={() => setStageFilter(s.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              stageFilter === s.value
                ? "bg-black text-white"
                : "bg-muted text-foreground/60 hover:bg-accent hover:text-primary"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Projects */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Rss className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No projects yet</h3>
          <p className="text-sm text-foreground/50">
            Be the first to share what you&apos;re building!
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
