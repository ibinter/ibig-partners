"use client";

import { useActionState, useRef, useEffect } from "react";
import { verifyOtpAction, resendOtpAction } from "./actions";

export default function OtpForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(verifyOtpAction, null);
  const [resendState, resendAction, resendPending] = useActionState(resendOtpAction, null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first box
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  function handleInput(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, "");
    e.target.value = val.slice(-1);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !e.currentTarget.value && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      text.split("").forEach((ch, i) => {
        if (inputRefs.current[i]) inputRefs.current[i]!.value = ch;
      });
      inputRefs.current[5]?.focus();
    }
  }

  function getCode() {
    return inputRefs.current.map((r) => r?.value ?? "").join("");
  }

  return (
    <div className="space-y-5">
      {state?.error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </div>
      )}
      {resendState?.success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          ✅ Nouveau code envoyé — vérifiez votre boîte mail.
        </div>
      )}

      <form
        action={(fd) => {
          fd.set("code", getCode());
          if (next) fd.set("next", next);
          formAction(fd);
        }}
        className="space-y-5"
      >
        <input type="hidden" name="code" value="" />
        {next && <input type="hidden" name="next" value={next} />}

        {/* 6-digit boxes */}
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
          {Array.from({ length: 6 }).map((_, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              onChange={(e) => handleInput(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="h-14 w-11 rounded-xl border-2 border-slate-200 bg-slate-50 text-center text-xl font-bold text-ink outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60 transition"
        >
          {pending ? "Vérification…" : "Vérifier le code"}
        </button>
      </form>

      <form action={resendAction} className="text-center">
        <button
          type="submit"
          disabled={resendPending}
          className="text-sm text-brand-600 hover:underline disabled:opacity-50"
        >
          {resendPending ? "Envoi…" : "Renvoyer un code"}
        </button>
      </form>
    </div>
  );
}
