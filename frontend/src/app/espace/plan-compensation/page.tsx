import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import PlanCompensationClient from "./plan-compensation-client";

export const dynamic = "force-dynamic";

export default async function PlanCompensationPage() {
  const user = await requireUser();
  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Plan de Compensation"
        subtitle="Comprenez exactement combien vous gagnez à chaque niveau et comment progresser."
      />
      <PlanCompensationClient userStatus={user.status} />
    </div>
  );
}
