"use client";

export function ExportButton({ type, label }: { type: string; label?: string }) {
  return (
    <a
      href={`/api/admin/export?type=${type}`}
      download
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      ⬇ {label ?? "Exporter CSV"}
    </a>
  );
}
