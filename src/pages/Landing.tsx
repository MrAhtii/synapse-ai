import { ArrowRight, Sparkles, Brain, GraduationCap, Zap } from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";

export default function Landing() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <PageContainer className="relative text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-foreground/60 mb-8">
            <Sparkles size={14} className="text-accent" />
            AI-Powered Learning Platform
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight max-w-3xl mx-auto">
            Learn Smarter with
            <span className="text-primary"> AI</span>
          </h1>
          <p className="mt-6 text-lg text-foreground/60 max-w-xl mx-auto">
            Upload your notes, get instant AI summaries, generate flashcards and quizzes — and track your progress.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button as="a" href="/register" size="lg">
              Get Started Free
              <ArrowRight size={18} />
            </Button>
            <Button as="a" href="/login" variant="ghost" size="lg">
              Sign In
            </Button>
          </div>
        </PageContainer>
      </section>

      {/* Explore Demo */}
      <section className="border-t border-border bg-gradient-to-br from-accent/[0.03] via-transparent to-primary/[0.03] py-16 sm:py-20">
        <PageContainer className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-6">
            <Zap size={14} />
            No Sign-Up Required
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground max-w-2xl mx-auto">
            Experience Synapse AI Instantly
          </h2>
          <p className="mt-4 text-lg text-foreground/60 max-w-xl mx-auto">
            Explore the complete AI learning experience without uploading your own notes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button as="a" href="/demo" size="lg" variant="primary">
              <Zap size={18} />
              Try Demo
            </Button>
            <Button as="a" href="/register" variant="outline" size="lg">
              Upload My Own Notes
              <ArrowRight size={18} />
            </Button>
          </div>
        </PageContainer>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card py-20">
        <PageContainer>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI Summaries",
                desc: "Upload your notes and get concise, intelligent summaries in seconds.",
              },
              {
                icon: Sparkles,
                title: "Smart Quizzes",
                desc: "Generate practice quizzes from your materials to test your knowledge.",
              },
              {
                icon: GraduationCap,
                title: "Flashcards",
                desc: "Turn your notes into digital flashcards for spaced repetition learning.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-background p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon size={20} />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-foreground/60">{feature.desc}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>
    </div>
  );
}