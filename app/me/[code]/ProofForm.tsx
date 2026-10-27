"use client";
import { useActionState } from "react";
import { uploadProof } from "@/app/actions";

export default function ProofForm({ code, hasProof }: { code: string; hasProof: boolean }) {
  const [state, action, pending] = useActionState(uploadProof, null);
  return (
    <form action={action} className="mt-5 flex flex-wrap items-end gap-3">
      <input type="hidden" name="code" value={code} />
      <div className="min-w-56 flex-1">
        <label className="label" htmlFor="proof">{hasProof ? "تم رفع الإثبات — يمكنك استبداله" : "صورة إثبات الدفع"}</label>
        <input id="proof" name="proof" type="file" accept="image/png,image/jpeg,image/webp" required className="field file:me-3 file:rounded-md file:border-0 file:bg-gold file:px-3 file:py-1 file:text-night" />
      </div>
      <button disabled={pending} className="btn-summit disabled:opacity-50">{pending ? "جارٍ الرفع…" : "رفع"}</button>
      {state?.error && <p role="alert" className="w-full text-sm text-rose">{state.error}</p>}
    </form>
  );
}
