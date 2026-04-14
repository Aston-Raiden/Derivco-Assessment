"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Loader2,
  GitBranch,
  ExternalLink,
  MessageSquare,
  HandMetal,
  Target,
  CheckCircle2,
  Circle,
  Plus,
  Send,
  Trash2,
  Edit3,
  Trophy,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface Milestone {
  id: string;
  title: string;
  description?: string | null;
  isAchieved: boolean;
  achievedAt?: string | null;
  createdAt: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; avatar?: string | null };
}

interface CollabRequest {
  id: string;
  message?: string | null;
  status: string;
  createdAt: string;
  user: { id: string; name: string; avatar?: string | null };
}

interface Project {
  id: string;
  title: string;
  description: string;
  stage: string;
  supportNeeded?: string | null;
  techStack?: string | null;
  repoUrl?: string | null;
  liveUrl?: string | null;
  isCompleted: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    bio?: string | null;
    github?: string | null;
    skills?: string | null;
  };
  milestones: Milestone[];
  comments: Comment[];
  collaborations: CollabRequest[];
  _count: { comments: number; collaborations: number };
}

const stageLabels: Record<string, string> = {
  idea: "Idea",
  planning: "Planning",
  "in-progress": "In Progress",
  testing: "Testing",
  completed: "Completed",
};

const stageClasses: Record<string, string> = {
  idea: "stage-idea",
  planning: "stage-planning",
  "in-progress": "stage-in-progress",
  testing: "stage-testing",
  completed: "stage-completed",
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [collabMessage, setCollabMessage] = useState("");
  const [newMilestone, setNewMilestone] = useState({ title: "", description: "" });
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [showCollabForm, setShowCollabForm] = useState(false);
  const [submitting, setSubmitting] = useState("");
  const [editingStage, setEditingStage] = useState(false);

  const isOwner = session?.user?.id === project?.userId;

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProject(data);
    } catch {
      router.push("/feed");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting("comment");
    try {
      const res = await fetch(`/api/projects/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });
      if (res.ok) {
        setComment("");
        fetchProject();
      }
    } finally {
      setSubmitting("");
    }
  };

  const handleCollaborate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting("collab");
    try {
      const res = await fetch(`/api/projects/${id}/collaborate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: collabMessage }),
      });
      if (res.ok) {
        setCollabMessage("");
        setShowCollabForm(false);
        fetchProject();
      }
    } finally {
      setSubmitting("");
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestone.title.trim()) return;
    setSubmitting("milestone");
    try {
      const res = await fetch(`/api/projects/${id}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMilestone),
      });
      if (res.ok) {
        setNewMilestone({ title: "", description: "" });
        setShowMilestoneForm(false);
        fetchProject();
      }
    } finally {
      setSubmitting("");
    }
  };

  const handleToggleMilestone = async (milestoneId: string, isAchieved: boolean) => {
    try {
      await fetch(`/api/projects/${id}/milestones`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, isAchieved: !isAchieved }),
      });
      fetchProject();
    } catch {
      // silently fail
    }
  };

  const handleUpdateStage = async (newStage: string) => {
    try {
      await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      setEditingStage(false);
      fetchProject();
    } catch {
      // silently fail
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
      router.push("/feed");
    } catch {
      // silently fail
    }
  };

  const handleCollabResponse = async (collaborationId: string, status: string) => {
    try {
      await fetch(`/api/projects/${id}/collaborate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collaborationId, status }),
      });
      fetchProject();
    } catch {
      // silently fail
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) return null;

  const achievedCount = project.milestones.filter((m) => m.isAchieved).length;
  const totalMilestones = project.milestones.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <Link
        href="/feed"
        className="inline-flex items-center gap-1 text-sm text-foreground/50 hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Feed
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Project Header */}
        <div className="bg-white rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {project.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{project.user.name}</p>
                <p className="text-xs text-foreground/40 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Created{" "}
                  {formatDistanceToNow(new Date(project.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOwner && !editingStage && (
                <button
                  onClick={() => setEditingStage(true)}
                  className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                  title="Update stage"
                >
                  <Edit3 className="w-4 h-4 text-foreground/40" />
                </button>
              )}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${stageClasses[project.stage] || ""}`}
              >
                {stageLabels[project.stage] || project.stage}
              </span>
            </div>
          </div>

          {/* Stage editor */}
          <AnimatePresence>
            {editingStage && isOwner && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 flex flex-wrap gap-2"
              >
                {Object.entries(stageLabels).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => handleUpdateStage(value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      project.stage === value
                        ? "bg-primary text-white"
                        : "bg-muted text-foreground/60 hover:bg-accent"
                    }`}
                  >
                    {label}
                    {value === "completed" && " (Ship it!)"}
                  </button>
                ))}
                <button
                  onClick={() => setEditingStage(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-foreground/40 hover:text-foreground"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {project.isCompleted && (
            <div className="mb-4 px-4 py-3 bg-accent rounded-xl border border-primary/20 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <p className="text-sm font-medium text-primary">
                This project has been completed and is on the Celebration Wall!
              </p>
            </div>
          )}

          <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
          <p className="text-foreground/70 mb-4 whitespace-pre-wrap">
            {project.description}
          </p>

          {project.techStack && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.techStack.split(",").map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 bg-muted rounded-lg text-xs text-foreground/60 font-medium"
                >
                  {tech.trim()}
                </span>
              ))}
            </div>
          )}

          {project.supportNeeded && (
            <div className="mb-4 px-4 py-3 bg-accent/50 rounded-xl border border-primary/10">
              <p className="text-sm">
                <span className="font-semibold text-primary">Looking for:</span>{" "}
                {project.supportNeeded}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 pt-4 border-t border-border">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-primary transition-colors"
              >
                <GitBranch className="w-4 h-4" />
                Repository
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-primary transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </a>
            )}
            {isOwner && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 transition-colors ml-auto"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left column - Milestones & Comments */}
          <div className="md:col-span-2 space-y-6">
            {/* Milestones */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">
                    Milestones{" "}
                    {totalMilestones > 0 && (
                      <span className="text-foreground/40 font-normal">
                        ({achievedCount}/{totalMilestones})
                      </span>
                    )}
                  </h2>
                </div>
                {isOwner && (
                  <button
                    onClick={() => setShowMilestoneForm(!showMilestoneForm)}
                    className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                  >
                    <Plus className="w-4 h-4 text-primary" />
                  </button>
                )}
              </div>

              {/* Progress bar */}
              {totalMilestones > 0 && (
                <div className="mb-4">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(achievedCount / totalMilestones) * 100}%`,
                      }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              )}

              {/* Add milestone form */}
              <AnimatePresence>
                {showMilestoneForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddMilestone}
                    className="mb-4 p-3 bg-muted rounded-xl space-y-2"
                  >
                    <input
                      type="text"
                      value={newMilestone.title}
                      onChange={(e) =>
                        setNewMilestone({ ...newMilestone, title: e.target.value })
                      }
                      placeholder="Milestone title"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <input
                      type="text"
                      value={newMilestone.description}
                      onChange={(e) =>
                        setNewMilestone({
                          ...newMilestone,
                          description: e.target.value,
                        })
                      }
                      placeholder="Description (optional)"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="submit"
                      disabled={submitting === "milestone"}
                      className="px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                      {submitting === "milestone" ? "Adding..." : "Add Milestone"}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Milestone list */}
              <div className="space-y-2">
                {project.milestones.length === 0 ? (
                  <p className="text-sm text-foreground/40 text-center py-4">
                    No milestones yet
                  </p>
                ) : (
                  project.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <button
                        onClick={() =>
                          isOwner &&
                          handleToggleMilestone(milestone.id, milestone.isAchieved)
                        }
                        disabled={!isOwner}
                        className="mt-0.5 flex-shrink-0"
                      >
                        {milestone.isAchieved ? (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        ) : (
                          <Circle className="w-5 h-5 text-foreground/20" />
                        )}
                      </button>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            milestone.isAchieved
                              ? "line-through text-foreground/40"
                              : ""
                          }`}
                        >
                          {milestone.title}
                        </p>
                        {milestone.description && (
                          <p className="text-xs text-foreground/40">
                            {milestone.description}
                          </p>
                        )}
                        {milestone.achievedAt && (
                          <p className="text-xs text-primary mt-0.5">
                            Achieved{" "}
                            {formatDistanceToNow(new Date(milestone.achievedAt), {
                              addSuffix: true,
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">
                  Comments{" "}
                  <span className="text-foreground/40 font-normal">
                    ({project._count.comments})
                  </span>
                </h2>
              </div>

              {/* Comment form */}
              {session ? (
                <form onSubmit={handleComment} className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="flex-1 px-4 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={!comment.trim() || submitting === "comment"}
                    className="p-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {submitting === "comment" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              ) : (
                <p className="mb-4 text-sm text-foreground/40">
                  <Link href="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>{" "}
                  to comment
                </p>
              )}

              {/* Comments list */}
              <div className="space-y-3">
                {project.comments.length === 0 ? (
                  <p className="text-sm text-foreground/40 text-center py-4">
                    No comments yet. Be the first!
                  </p>
                ) : (
                  project.comments.map((c) => (
                    <div key={c.id} className="flex gap-3 p-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                        {c.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{c.user.name}</p>
                          <p className="text-xs text-foreground/30">
                            {formatDistanceToNow(new Date(c.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <p className="text-sm text-foreground/70">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right column - Collaboration */}
          <div className="space-y-6">
            {/* Raise Hand / Collaborate */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <HandMetal className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Collaborate</h2>
              </div>

              {session && !isOwner && (
                <>
                  {!showCollabForm ? (
                    <button
                      onClick={() => setShowCollabForm(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent text-primary rounded-xl font-medium text-sm hover:bg-primary hover:text-white transition-all"
                    >
                      <HandMetal className="w-4 h-4" />
                      Raise Your Hand
                    </button>
                  ) : (
                    <form onSubmit={handleCollaborate} className="space-y-2">
                      <textarea
                        value={collabMessage}
                        onChange={(e) => setCollabMessage(e.target.value)}
                        placeholder="Why do you want to collaborate? (optional)"
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={submitting === "collab"}
                          className="flex-1 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
                        >
                          {submitting === "collab" ? "Sending..." : "Send Request"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCollabForm(false)}
                          className="px-3 py-2 border border-border rounded-xl text-sm hover:bg-muted"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {/* Collaboration requests */}
              <div className="mt-4 space-y-3">
                {project.collaborations.length === 0 ? (
                  <p className="text-xs text-foreground/40 text-center py-2">
                    No collaboration requests yet
                  </p>
                ) : (
                  project.collaborations.map((collab) => (
                    <div
                      key={collab.id}
                      className="flex items-start gap-2 p-2 rounded-lg bg-muted"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                        {collab.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{collab.user.name}</p>
                        {collab.message && (
                          <p className="text-xs text-foreground/50 truncate">
                            {collab.message}
                          </p>
                        )}
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            collab.status === "accepted"
                              ? "bg-green-100 text-green-700"
                              : collab.status === "declined"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {collab.status}
                        </span>
                        {isOwner && collab.status === "pending" && (
                          <div className="flex gap-1 mt-1">
                            <button
                              onClick={() =>
                                handleCollabResponse(collab.id, "accepted")
                              }
                              className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium hover:bg-green-200"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                handleCollabResponse(collab.id, "declined")
                              }
                              className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium hover:bg-red-200"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* About the builder */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="font-semibold mb-3 text-sm">About the Builder</h2>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {project.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{project.user.name}</p>
                  <p className="text-xs text-foreground/40">{project.user.email}</p>
                </div>
              </div>
              {project.user.bio && (
                <p className="text-xs text-foreground/60 mb-2">{project.user.bio}</p>
              )}
              {project.user.skills && (
                <div className="flex flex-wrap gap-1">
                  {JSON.parse(project.user.skills || "[]").map((skill: string) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-muted rounded text-[10px] font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
