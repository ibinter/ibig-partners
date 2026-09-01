import { PageHeader } from "@/components/ui";
import SimulateurClient from "./simulateur-client";

export const dynamic = "force-dynamic";

export default function SimulateurPage() {
  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Simulateur de Commissions"
        subtitle="Calculez vos gains potentiels avant même de vendre — ajustez les paramètres et voyez vos revenus en temps réel."
      />
      <SimulateurClient />
    </div>
  );
}
