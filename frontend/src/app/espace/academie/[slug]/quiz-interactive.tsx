"use client";

import { useState, useTransition } from "react";
import { markModuleComplete } from "../actions";

interface Q { question: string; options: string[]; answer: number; }

export default function QuizInteractive({ questions, moduleId, moduleSlug, alreadyCompleted }: {
  questions: Q[];
  moduleId: string;
  moduleSlug: string;
  alreadyCompleted: boolean;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [, startTransition] = useTransition();

  if (questions.length === 0) return <p className="text-sm text-slate-400">Ce quiz ne contient pas encore de questions.</p>;

  const score = submitted
    ? questions.filter((q, i) => answers[i] === q.answer).length
    : 0;
  const pct = submitted ? Math.round((score / questions.length) * 100) : 0;
  const passed = pct >= 70;

  function submit() {
    setSubmitted(true);
    if (passed && !alreadyCompleted) {
      const fd = new FormData();
      fd.set("moduleId", moduleId);
      fd.set("slug", moduleSlug);
      startTransition(() => markModuleComplete(fd));
    }
  }

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => (
        <div key={qi} className={`rounded-xl border p-5 transition-colors ${submitted ? (answers[qi] === q.answer ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50") : "border-slate-200"}`}>
          <p className="mb-3 font-semibold text-slate-800 text-sm">{qi + 1}. {q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const isCorrect = oi === q.answer;
              const isChosen = answers[qi] === oi;
              return (
                <label key={oi} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition ${
                  submitted
                    ? isCorrect ? "border-emerald-400 bg-emerald-100" : isChosen ? "border-rose-400 bg-rose-100" : "border-slate-200 opacity-60"
                    : "border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                }`}>
                  <input
                    type="radio"
                    name={`q_${qi}`}
                    value={oi}
                    disabled={submitted}
                    checked={answers[qi] === oi}
                    onChange={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-slate-700">{opt}</span>
                  {submitted && isCorrect && <span className="ml-auto text-emerald-600 text-xs font-bold">✓ Bonne réponse</span>}
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={submit}
          disabled={Object.keys(answers).length < questions.length}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Valider mes réponses ({Object.keys(answers).length}/{questions.length} répondues)
        </button>
      ) : (
        <div className={`rounded-2xl p-5 text-center ${passed ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"}`}>
          <p className="text-3xl mb-1">{passed ? "🎉" : "📚"}</p>
          <p className={`font-extrabold text-xl mb-1 ${passed ? "text-emerald-700" : "text-amber-700"}`}>
            {score}/{questions.length} — {pct}%
          </p>
          <p className={`text-sm ${passed ? "text-emerald-600" : "text-amber-600"}`}>
            {passed
              ? alreadyCompleted ? "Bravo ! Module déjà validé." : "Bravo ! Module marqué comme complété."
              : "Score insuffisant (70% requis). Révisez et réessayez."}
          </p>
          {!passed && (
            <button onClick={() => { setAnswers({}); setSubmitted(false); }}
              className="mt-3 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600">
              Réessayer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
