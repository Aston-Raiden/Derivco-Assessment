// landing page - hero, features, how-it-works, stats, and CTA
// redirects to /feed if already logged in
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Rocket,
  Users,
  Trophy,
  ArrowRight,
  Code2,
  GitBranch,
  MessageSquare,
  Target,
} from "lucide-react";

export default function LandingPage() {
  const { data: session } = useSession();

  if (session) {
    redirect("/feed");
  }

  const features = [
    {
      icon: Code2,
      title: "Build in Public",
      description:
        "Share your projects with the community. Document your journey from idea to deployment.",
    },
    {
      icon: Users,
      title: "Collaborate",
      description:
        "Raise your hand to collaborate on projects. Connect with developers who share your passion.",
    },
    {
      icon: Target,
      title: "Track Milestones",
      description:
        "Set milestones and track your progress. Stay motivated with visible achievements.",
    },
    {
      icon: Trophy,
      title: "Celebrate Success",
      description:
        "Completed your project? Join the Celebration Wall and inspire other builders.",
    },
  ];

  const stats = [
    { label: "Builders", value: "50+" },
    { label: "Projects", value: "120+" },
    { label: "Collaborations", value: "30+" },
    { label: "Shipped", value: "45+" },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent border border-primary/20 text-primary text-sm font-medium mb-8">
                <Rocket className="w-4 h-4" />
                South Africa&apos;s Developer Community
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
            >
              Build in Public.
              <br />
              <span className="text-primary">Grow Together.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto mb-10"
            >
              MzansiBuilds is where South African developers share what they&apos;re
              building, track their progress, collaborate with peers, and celebrate
              every milestone.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white rounded-xl text-base font-semibold hover:bg-primary transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
              >
                Start Building
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/feed"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-foreground rounded-xl text-base font-semibold border border-border hover:border-primary/30 hover:bg-accent transition-all"
              >
                <GitBranch className="w-4 h-4" />
                Explore Projects
              </Link>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-foreground/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to{" "}
              <span className="text-primary">build in public</span>
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              From idea to celebration, MzansiBuilds supports every stage of your
              development journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <feature.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How it works</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-0">
            {[
              {
                step: "01",
                title: "Create your account",
                desc: "Sign up and set up your developer profile with your skills and interests.",
              },
              {
                step: "02",
                title: "Share your project",
                desc: "Post what you're building, the current stage, and what support you need.",
              },
              {
                step: "03",
                title: "Build & collaborate",
                desc: "Update your progress, hit milestones, and connect with other builders.",
              },
              {
                step: "04",
                title: "Celebrate",
                desc: "Complete your project and get featured on the Celebration Wall!",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex gap-6 items-start py-8 border-b border-border last:border-0"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-black text-primary font-bold text-xl flex items-center justify-center">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                  <p className="text-foreground/60">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <MessageSquare className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">
              Ready to build in public?
            </h2>
            <p className="text-white/60 max-w-lg mx-auto mb-8">
              Join the community of South African developers building amazing things
              together.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl text-base font-semibold hover:bg-primary-light transition-all shadow-lg hover:shadow-primary/25"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" />
            <span className="font-semibold">
              Mzansi<span className="text-primary">Builds</span>
            </span>
          </div>
          <p className="text-sm text-foreground/50">
            Built with pride in South Africa
          </p>
        </div>
      </footer>
    </div>
  );
}
