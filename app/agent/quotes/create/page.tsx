// app/agent/quotes/create/page.tsx
// Redirect to new Quote Workspace
import { redirect } from "next/navigation";

export default function CreateQuotePage({
  searchParams,
}: {
  searchParams: { clientId?: string };
}) {
  const clientId = searchParams?.clientId;
  redirect(clientId ? `/agent/quotes/workspace?clientId=${clientId}` : "/agent/quotes/workspace");
}
