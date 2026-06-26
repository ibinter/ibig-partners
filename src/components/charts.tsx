"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─── Formateur FCFA pour les tooltips ─────────────────────────────────────
function fcfaShort(val: number) {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} M`;
  if (val >= 1_000) return `${Math.round(val / 1_000)} k`;
  return String(val);
}

// ─── Graphique CA mensuel (admin) ─────────────────────────────────────────
export function RevenueBarChart({
  data,
}: {
  data: { mois: string; ca: number; commissions: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#5b6577" }} />
        <YAxis tickFormatter={fcfaShort} tick={{ fontSize: 11, fill: "#5b6577" }} width={52} />
        <Tooltip
          formatter={(v, name) => [
            new Intl.NumberFormat("fr-FR").format(Number(v)) + " FCFA",
            name === "ca" ? "CA" : "Commissions",
          ]}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
        />
        <Legend formatter={(v) => (v === "ca" ? "CA généré" : "Commissions")} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="ca" fill="#0b5fff" radius={[4, 4, 0, 0]} />
        <Bar dataKey="commissions" fill="#e69a14" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Graphique commissions partenaire (ligne) ──────────────────────────────
export function CommissionsLineChart({
  data,
}: {
  data: { mois: string; montant: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#5b6577" }} />
        <YAxis tickFormatter={fcfaShort} tick={{ fontSize: 11, fill: "#5b6577" }} width={52} />
        <Tooltip
          formatter={(v) => [new Intl.NumberFormat("fr-FR").format(Number(v)) + " FCFA", "Commissions"]}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
        />
        <Line
          type="monotone"
          dataKey="montant"
          stroke="#0b5fff"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#0b5fff" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Graphique réseau partenaire (barres empilées par niveau) ─────────────
export function NetworkBarChart({
  data,
}: {
  data: { mois: string; n1: number; n2: number; n3: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#5b6577" }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#5b6577" }} width={32} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="n1" name="N1" fill="#0b5fff" stackId="a" />
        <Bar dataKey="n2" name="N2" fill="#60a5fa" stackId="a" />
        <Bar dataKey="n3" name="N3" fill="#bfdbfe" stackId="a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
