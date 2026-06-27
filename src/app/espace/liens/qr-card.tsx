"use client";

import { useEffect, useRef, useState } from "react";

export default function QrCard({ url, slug }: { url: string; slug: string }) {
  const [qr, setQr] = useState<string | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(url, { width: 220, margin: 1 }).then(setQr);
    });
  }, [url]);

  if (!qr) return null;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qr} alt="QR code" className="hidden" id={`qr-${slug}`} />
      <a
        href={qr}
        download={`qr-${slug}.png`}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
      >
        📥 Télécharger le QR
      </a>
    </>
  );
}
