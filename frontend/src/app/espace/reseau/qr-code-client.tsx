"use client";

import { useEffect, useRef } from "react";

export default function QrCodeClient({ url, partnerName }: { url: string; partnerName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    import("qrcode").then((QRCode) => {
      if (cancelled || !canvasRef.current) return;
      QRCode.toCanvas(canvasRef.current, url, { width: 200, margin: 2, color: { dark: "#0f172a", light: "#ffffff" } });
    });
    return () => { cancelled = true; };
  }, [url]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-parrainage-${partnerName}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-800 text-sm mb-1">Mon QR Code de parrainage</h3>
      <p className="text-xs text-slate-500 mb-4">Partagez ce QR code pour recruter des filleuls offline</p>
      <div className="flex flex-col items-center gap-4">
        <canvas ref={canvasRef} className="rounded-xl border border-slate-100" />
        <p className="text-[11px] text-slate-400 text-center break-all max-w-[220px]">{url}</p>
        <button
          onClick={download}
          className="w-full rounded-xl bg-slate-800 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
        >
          ⬇ Télécharger le QR code
        </button>
      </div>
    </div>
  );
}
