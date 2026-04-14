// user profile page - can edit your bio, skills, github, linkedin
// also shows all your projects below
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ProjectCard from "@/components/ProjectCard";
import {
  User,
  Edit3,
  Save,
  Loader2,
  GitBranch,
  Link2,
  Briefcase,
  X,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string | null;
  avatar?: string | null;
  github?: string | null;
  linkedin?: string | null;
  skills?: string | null;
}

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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    github: "",
    linkedin: "",
    skills: "",
  });

  const fetchProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const [userRes, projectsRes] = await Promise.all([
        fetch(`/api/users/${session.user.id}`),
        fetch(`/api/projects?userId=${session.user.id}`),
      ]);
      const userData = await userRes.json();
      const projectsData = await projectsRes.json();
      setProfile(userData);
      setProjects(projectsData.projects || []);
      setForm({
        name: userData.name || "",
        bio: userData.bio || "",
        github: userData.github || "",
        linkedin: userData.linkedin || "",
        skills: userData.skills
          ? JSON.parse(userData.skills).join(", ")
          : "",
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session, status, router, fetchProfile]);

  const handleSave = async () => {
    if (!session?.user?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${session.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          bio: form.bio,
          github: form.github,
          linkedin: form.linkedin,
          skills: JSON.stringify(
            form.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          ),
        }),
      });
      if (res.ok) {
        setEditing(false);
        fetchProfile();
      }
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  const completedCount = projects.filter((p) => p.isCompleted).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden mb-8">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-black via-primary-dark to-black" />

          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-8 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-primary">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={() => {
                  if (editing) handleSave();
                  else setEditing(true);
                }}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all bg-accent text-primary hover:bg-primary hover:text-white"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editing ? (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => setEditing(false)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <X className="w-4 h-4 text-foreground/40" />
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-foreground/60">
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-foreground/60">
                    Bio
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={3}
                    placeholder="Tell the community about yourself..."
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-foreground/60">
                      GitHub Username
                    </label>
                    <input
                      type="text"
                      value={form.github}
                      onChange={(e) =>
                        setForm({ ...form, github: e.target.value })
                      }
                      placeholder="username"
                      className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-foreground/60">
                      LinkedIn URL
                    </label>
                    <input
                      type="text"
                      value={form.linkedin}
                      onChange={(e) =>
                        setForm({ ...form, linkedin: e.target.value })
                      }
                      placeholder="linkedin.com/in/..."
                      className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-foreground/60">
                    Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={form.skills}
                    onChange={(e) =>
                      setForm({ ...form, skills: e.target.value })
                    }
                    placeholder="React, Node.js, Python, etc."
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-sm text-foreground/50">{profile.email}</p>
                {profile.bio && (
                  <p className="text-sm text-foreground/70 mt-2">{profile.bio}</p>
                )}

                <div className="flex items-center gap-4 mt-3">
                  {profile.github && (
                    <a
                      href={`https://github.com/${profile.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-foreground/50 hover:text-primary transition-colors"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      {profile.github}
                    </a>
                  )}
                  {profile.linkedin && (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-foreground/50 hover:text-primary transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      LinkedIn
                    </a>
                  )}
                </div>

                {profile.skills && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {JSON.parse(profile.skills).map((skill: string) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 bg-accent rounded-lg text-xs font-medium text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-foreground/40" />
                    <span className="text-sm font-medium">{projects.length}</span>
                    <span className="text-xs text-foreground/40">Projects</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{completedCount}</span>
                    <span className="text-xs text-foreground/40">Completed</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* User's Projects */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold">My Projects</h2>
        </div>
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-border">
              <Briefcase className="w-12 h-12 text-foreground/10 mx-auto mb-3" />
              <p className="text-sm text-foreground/50">
                You haven&apos;t created any projects yet.
              </p>
            </div>
          ) : (
            projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
