"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Rocket,
  ArrowRight,
  Loader2,
  Lightbulb,
  ClipboardList,
  Code2,
  FlaskConical,
  CheckCircle2,
} from "lucide-react";

const stageOptions = [
  {
    value: "idea",
    label: "Idea",
    icon: Lightbulb,
    description: "Just an idea, exploring possibilities",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    value: "planning",
    label: "Planning",
    icon: ClipboardList,
    description: "Designing architecture and planning features",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    value: "in-progress",
    label: "In Progress",
    icon: Code2,
    description: "Actively coding and building",
    color: "text-green-600 bg-green-50 border-green-200",
  },
  {
    value: "testing",
    label: "Testing",
    icon: FlaskConical,
    description: "Testing, fixing bugs, and polishing",
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  {
    value: "completed",
    label: "Completed",
    icon: CheckCircle2,
    description: "Project is done and shipped!",
    color: "text-primary bg-accent border-primary/20",
  },
];

export default function NewProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    stage: "",
    supportNeeded: "",
    techStack: "",
    repoUrl: "",
    liveUrl: "",
  });

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.description || !form.stage) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create project");
        return;
      }

      const project = await res.json();
      router.push(`/projects/${project.id}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Rocket className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold">New Project</h1>
          </div>
          <p className="text-sm text-foreground/50">
            Share what you&apos;re building with the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., AI-Powered Recipe Generator"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your project - what does it do? What problem does it solve?"
              required
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
            />
          </div>

          {/* Stage */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Current Stage <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {stageOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setForm({ ...form, stage: option.value })}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                    form.stage === option.value
                      ? `${option.color} border-2`
                      : "border-border hover:border-foreground/20"
                  }`}
                >
                  <option.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{option.label}</p>
                    <p className="text-xs opacity-70">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Support Needed */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Support Needed
            </label>
            <input
              type="text"
              value={form.supportNeeded}
              onChange={(e) => setForm({ ...form, supportNeeded: e.target.value })}
              placeholder="e.g., Code review, UI design help, Backend expertise"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Tech Stack
            </label>
            <input
              type="text"
              value={form.techStack}
              onChange={(e) => setForm({ ...form, techStack: e.target.value })}
              placeholder="e.g., React, Node.js, PostgreSQL (comma separated)"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>

          {/* Repo URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Repository URL
              </label>
              <input
                type="url"
                value={form.repoUrl}
                onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Live URL</label>
              <input
                type="url"
                value={form.liveUrl}
                onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                placeholder="https://myproject.com"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white rounded-xl font-semibold hover:bg-primary transition-all disabled:opacity-50 text-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Share Project
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
