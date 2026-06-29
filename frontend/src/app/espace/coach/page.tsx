import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { CoachChat } from "./CoachChat";

export const dynamic = "force-dynamic";

export default async function CoachPage() {
  const user = await requireUser();

  return (
    <div className="space-y-5">
      <PageHeader
        title="✨ Coach IA"
        subtitle="Votre assistant personnel pour vendre, recruter et performer"
      />

      <CoachChat
        partnerName={`${user.firstName} ${user.lastName}`}
        partnerStatus={user.status}
        partnerCity={user.city ?? ""}
        partnerCode={user.code}
      />
    </div>
  );
}
