"use client";

import { useEffect } from "react";

export default function PrintTrigger() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, []);
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mb-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 print:hidden"
    >
      Imprimer / Enregistrer en PDF
    </button>
  );
}
