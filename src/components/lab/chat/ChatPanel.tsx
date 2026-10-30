import { useEffect, useRef, useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Answer } from "@/lib/ai/answer";
import { answerQuestion } from "@/lib/ai/assistant";
import { deleteChat, listReports, loadChat, saveChat } from "@/lib/lab/storage";
import type { LabReport } from "@/lib/lab/types";
import { AnswerView } from "./AnswerView";
import { ModelStatus } from "./ModelStatus";
import { useLocalModel } from "./useLocalModel";

interface Msg {
  id: string;
  role: "user" | "assistant";
  text: string;
  answer?: Answer;
}

const STARTERS = [
  "Which results are outside the lab's range?",
  "Can you explain my hemoglobin?",
  "What does cholesterol measure?",
  "How does this compare with my previous report?",
  "What should I ask my doctor?",
];

export function ChatPanel({ report }: { report: LabReport }) {
  const { state, adapter, ready, load } = useLocalModel();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [streaming, setStreaming] = useState<{ id: string; text: string } | null>(null);
  const [all, setAll] = useState<LabReport[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChat<Msg>(report.id).then(setMsgs).catch(() => setMsgs([]));
    listReports().then(setAll).catch(() => setAll([]));
  }, [report.id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, streaming]);

  const ask = async (q: string) => {
    const question = q.trim();
    if (!question || busy) return;
    setInput("");
    setBusy(true);
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text: question };
    const pendingId = crypto.randomUUID();
    let next = [...msgs, userMsg];
    setMsgs(next);
    try {
      // Show the grounded facts immediately while the model (if any) writes its wording.
      const { buildGroundedAnswer } = await import("@/lib/ai/answer");
      const draft = buildGroundedAnswer(question, report, all);
      if (ready) {
        setMsgs([...next, { id: pendingId, role: "assistant", text: "", answer: draft }]);
        setStreaming({ id: pendingId, text: "" });
      }
      const answer = await answerQuestion(question, report, all, ready ? adapter : null, (t) =>
        setStreaming((s) => (s ? { ...s, text: s.text + t } : s)),
      );
      next = [...next, { id: pendingId, role: "assistant", text: answer.summary, answer }];
      setMsgs(next);
      await saveChat(report.id, next);
    } finally {
      setStreaming(null);
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-border p-4">
        <ModelStatus state={state} onLoad={load} downloadSize={adapter?.downloadSize} />
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
        {msgs.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Ask anything about <strong className="text-foreground">{report.title}</strong>. Try:</p>
            <div className="flex flex-wrap gap-1.5">
              {STARTERS.map((s) => (
                <button key={s} onClick={() => ask(s)} className="rounded-full border border-border bg-card px-3 py-1.5 text-left text-xs hover:bg-secondary">{s}</button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground">{m.text}</div>
          ) : (
            <div key={m.id} className="rounded-2xl rounded-bl-sm border border-border bg-card p-3.5 shadow-soft">
              {m.answer && <AnswerView a={m.answer} streaming={streaming?.id === m.id ? streaming.text : undefined} onAsk={ask} />}
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      <form
        className="flex items-center gap-2 border-t border-border p-3"
        onSubmit={(e) => { e.preventDefault(); ask(input); }}
      >
        <Input aria-label="Your question" placeholder="Ask about your results…" value={input} onChange={(e) => setInput(e.target.value)} disabled={busy} />
        <Button type="submit" size="icon" className="shrink-0 rounded-full bg-gradient-brand" disabled={busy || !input.trim()} aria-label="Send">
          <Send className="h-4 w-4" />
        </Button>
        {msgs.length > 0 && (
          <Button type="button" size="icon" variant="ghost" aria-label="Clear chat history" onClick={async () => { await deleteChat(report.id); setMsgs([]); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </form>
    </div>
  );
}
