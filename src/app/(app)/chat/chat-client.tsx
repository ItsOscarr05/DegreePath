"use client";

import { useEffect, useRef, useState } from "react";
import {
  CircleCheck,
  Info,
  Send,
  Sparkles,
  User,
} from "lucide-react";

import { cn, formatPercent } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatStats {
  completedCredits: number;
  totalRequiredCredits: number;
  graduationProgress: number;
}

interface RecentCourse {
  code: string;
  title: string;
}

const SUGGESTED = [
  "What classes should I take next semester?",
  "Can I graduate one semester early?",
  "What happens if I fail Calculus II?",
];

export function ChatClient({
  majorName,
  stats,
  recentCompleted,
}: {
  majorName: string;
  stats: ChatStats;
  recentCompleted: RecentCourse[];
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    setError(null);
    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setPending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Chat failed.");
      setMessages([...next, { role: "assistant", content: body.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed.");
    } finally {
      setPending(false);
    }
  }

  const pct = stats.graduationProgress * 100;

  return (
    <div className="-mx-6 -my-24 flex h-screen text-stitch-onSurface md:-mx-10 md:-my-10">
      <main className="relative flex flex-1 flex-col bg-stitch-bg">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-stitch-surface/80 px-6 backdrop-blur-md md:px-10">
          <div>
            <h1 className="text-xl font-semibold leading-none text-stitch-onSurface">
              Advisor Chat
            </h1>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-stitch-onSurfaceVariant">
              Ask quick planning questions.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden flex-col items-end sm:flex">
              <span className="font-mono text-xs font-medium tracking-wider text-stitch-secondary">
                Academic Progress: {formatPercent(stats.graduationProgress)}
              </span>
              <div className="mt-1 h-1 w-32 overflow-hidden rounded-full bg-stitch-surfaceContainer">
                <div
                  className="h-full bg-stitch-secondary"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 justify-center overflow-y-auto px-6 py-10 md:px-10">
          <div className="w-full max-w-3xl space-y-10">
            {messages.length === 0 ? (
              <WelcomeBubble onPick={send} pct={pct} />
            ) : null}

            {messages.map((m, i) =>
              m.role === "assistant" ? (
                <AssistantBubble
                  key={i}
                  content={m.content}
                  showSuggestions={false}
                  onPick={send}
                />
              ) : (
                <UserBubble key={i} content={m.content} />
              ),
            )}

            {pending ? (
              <AssistantBubble
                content="Thinking…"
                muted
                showSuggestions={false}
                onPick={send}
              />
            ) : null}

            {error ? (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            ) : null}

            <div ref={endRef} />
          </div>
        </div>

        <div className="relative z-10 bg-gradient-to-t from-stitch-bg via-stitch-bg/95 to-transparent px-6 pb-10 pt-6 md:px-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="group relative mx-auto max-w-3xl"
          >
            <div className="pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-r from-stitch-primary/20 to-stitch-secondary/20 opacity-30 blur transition duration-500 group-focus-within:opacity-100" />
            <div className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-stitch-surfaceContainerHigh p-2 shadow-2xl">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your degree…"
                disabled={pending}
                className="flex-1 border-none bg-transparent px-3 py-3 text-base placeholder:text-stitch-onSurfaceVariant/40 focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                disabled={pending || !input.trim()}
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-stitch-primary text-stitch-onPrimaryContainer transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
                aria-label="Send"
              >
                <Send className="size-5" />
              </button>
            </div>
            <p className="mt-4 text-center font-mono text-[11px] tracking-wider text-stitch-onSurfaceVariant/40">
              For official sequencing, substitutions, or appeals, contact your
              university advisor.
            </p>
          </form>
        </div>
      </main>

      <aside className="hidden h-screen w-80 flex-col overflow-y-auto border-l border-white/10 bg-stitch-surface p-6 xl:flex">
        <h3 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-stitch-onSurface">
          Degree Status
        </h3>
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-stitch-onSurfaceVariant">
              {majorName}
            </span>
            <span className="font-mono text-xs font-medium tracking-wider text-stitch-secondary">
              {stats.completedCredits} / {stats.totalRequiredCredits} Credits
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-stitch-surfaceContainer">
            <div
              className="h-full bg-stitch-secondary"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-stitch-onSurfaceVariant">
            Recently Completed
          </p>
          {recentCompleted.length === 0 ? (
            <p className="text-xs text-stitch-onSurfaceVariant">
              No courses logged yet.
            </p>
          ) : (
            <div className="space-y-2">
              {recentCompleted.map((c) => (
                <div
                  key={c.code}
                  className="flex items-center gap-3 rounded border border-white/5 bg-stitch-surfaceContainer/30 p-3"
                >
                  <span className="font-mono text-xs font-medium tracking-wider text-stitch-secondary">
                    {c.code}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm leading-tight">{c.title}</p>
                  </div>
                  <CircleCheck
                    className="size-4 text-stitch-secondary"
                    strokeWidth={2}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative mt-8 space-y-4 overflow-hidden rounded border border-white/10 bg-stitch-bg p-6">
          <div className="absolute left-0 top-0 h-full w-1 bg-stitch-primary" />
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-stitch-primary">
            Advisor Reminder
          </p>
          <p className="text-sm leading-6 text-stitch-onSurfaceVariant">
            File your Intent to Graduate paperwork early — DegreePath plans the
            classes but your registrar still needs the forms.
          </p>
        </div>
      </aside>
    </div>
  );
}

function WelcomeBubble({
  onPick,
  pct,
}: {
  onPick: (text: string) => void;
  pct: number;
}) {
  return (
    <div className="group flex gap-4">
      <div className="shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-stitch-primary/40 bg-stitch-primary/20">
          <Sparkles className="size-5 text-stitch-primary" strokeWidth={2} />
        </div>
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-stitch-onSurface">
            DegreePath Assistant
          </span>
          <span className="font-mono text-[11px] tracking-wider text-stitch-onSurfaceVariant/60">
            Just now
          </span>
        </div>
        <div className="space-y-6 rounded-xl border border-white/5 bg-stitch-surfaceContainer p-6">
          <p className="text-base leading-7 text-stitch-onSurface">
            Hi! I&apos;ve loaded your degree requirements and completed
            courses. You&apos;re currently at{" "}
            <span className="font-bold text-stitch-secondary">
              {Math.round(pct)}%
            </span>{" "}
            of your way to graduation. Ask me anything about your remaining
            requirements, prerequisites, or how to optimize your schedule.
          </p>
          <div className="space-y-2 pt-4">
            <p className="font-mono text-xs italic tracking-wider text-stitch-onSurfaceVariant/70">
              Try asking about:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onPick(s)}
                  className="rounded-full border border-white/10 bg-stitch-surfaceContainerHigh px-4 py-2 font-mono text-xs tracking-wider text-stitch-onSurfaceVariant transition-all hover:border-white/20 hover:bg-white/10"
                >
                  &ldquo;{s}&rdquo;
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-stitch-onSurfaceVariant/40">
          <Info className="size-4" />
          <span className="font-mono text-[10px] uppercase tracking-widest">
            AI generated response. Verify with human advisor.
          </span>
        </div>
      </div>
    </div>
  );
}

function AssistantBubble({
  content,
  muted,
  showSuggestions,
  onPick,
}: {
  content: string;
  muted?: boolean;
  showSuggestions: boolean;
  onPick: (text: string) => void;
}) {
  return (
    <div className={cn("flex gap-4", muted && "opacity-70")}>
      <div className="shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-stitch-primary/40 bg-stitch-primary/20">
          <Sparkles className="size-5 text-stitch-primary" strokeWidth={2} />
        </div>
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-stitch-onSurface">
            DegreePath Assistant
          </span>
        </div>
        <div className="rounded-xl border border-white/5 bg-stitch-surfaceContainer p-6">
          <p className="whitespace-pre-wrap text-base leading-7 text-stitch-onSurface">
            {content}
          </p>
          {showSuggestions ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onPick(s)}
                  className="rounded-full border border-white/10 bg-stitch-surfaceContainerHigh px-4 py-2 font-mono text-xs tracking-wider text-stitch-onSurfaceVariant transition-all hover:border-white/20 hover:bg-white/10"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2 text-stitch-onSurfaceVariant/40">
          <Info className="size-4" />
          <span className="font-mono text-[10px] uppercase tracking-widest">
            AI generated. Verify with human advisor.
          </span>
        </div>
      </div>
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end gap-4">
      <div className="max-w-[80%] space-y-2">
        <div className="rounded-xl bg-stitch-primary p-6 text-stitch-onPrimaryContainer shadow-lg shadow-stitch-primary/10">
          <p className="whitespace-pre-wrap text-base leading-7">{content}</p>
        </div>
        <div className="flex items-center justify-end gap-2">
          <span className="font-mono text-[11px] tracking-wider text-stitch-onSurfaceVariant/60">
            Delivered
          </span>
        </div>
      </div>
      <div className="shrink-0">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-stitch-surfaceContainerHighest">
          <User className="size-5 text-stitch-onSurfaceVariant" />
        </div>
      </div>
    </div>
  );
}
