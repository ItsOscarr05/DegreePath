"use client";

import { useEffect, useRef, useState } from "react";
import { Compass, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED = [
  "What classes should I take next semester?",
  "Can I graduate one semester early?",
  "What happens if I fail Calculus II?",
];

export function ChatClient() {
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

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Advisor chat</h1>
        <p className="text-sm text-muted-foreground">
          Ask quick planning questions. Grounded in your profile and completed
          courses.
        </p>
      </header>

      <Card className="flex h-[60vh] flex-col">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-base">DegreePath assistant</CardTitle>
          <CardDescription>
            Replies are AI-generated. Verify anything important with your
            official advisor.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 space-y-4 overflow-y-auto py-4">
          {messages.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Try one of these:
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => <Bubble key={i} message={m} />)
          )}
          {pending ? (
            <Bubble
              message={{ role: "assistant", content: "Thinking…" }}
              muted
            />
          ) : null}
          <div ref={endRef} />
        </CardContent>
        <div className="border-t border-border/60 p-3">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your degree…"
              disabled={pending}
            />
            <Button type="submit" disabled={pending || !input.trim()}>
              <Send className="size-4" />
            </Button>
          </form>
          {error ? (
            <p className="mt-2 text-xs text-north">{error}</p>
          ) : null}
        </div>
      </Card>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Compass className="mt-0.5 size-3 shrink-0 text-north" />
        For official sequencing, substitutions, or appeals, contact your
        university advisor.
      </p>
    </div>
  );
}

function Bubble({ message, muted }: { message: Message; muted?: boolean }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-gold text-gold-foreground"
            : "bg-secondary text-foreground",
          muted && "opacity-70",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
