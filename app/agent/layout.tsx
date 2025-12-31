// app/agent/layout.tsx
// MINIMAL TEST - No components, no database
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Agent Portal - Fly2Any",
  description: "Travel Agent Management Portal",
};

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent");
  }

  // MINIMAL - just render children with basic wrapper
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:pl-16">
        <main className="py-4 px-4">
          {children}
        </main>
      </div>
    </div>
  );
}
