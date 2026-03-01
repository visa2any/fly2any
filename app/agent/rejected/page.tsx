import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Application Rejected - Fly2Any Agent Portal",
};

export default async function AgentRejectedPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/agent");

  // Get rejection reason from activity log
  const agent = await prisma!.travelAgent.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      activityLogs: {
        where: { activityType: 'agent_rejected' },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { description: true },
      },
    },
  }).catch(() => null);

  const rejectionDescription = agent?.activityLogs?.[0]?.description || null;
  const rejectionReason = rejectionDescription
    ? rejectionDescription.replace('Application rejected: ', '')
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-gray-400 to-gray-600" />
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Not Approved</h1>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
              Unfortunately, your agent application did not meet our current requirements. You may reapply after 30 days.
            </p>

            {rejectionReason && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left mb-5">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Reason provided</p>
                <p className="text-sm text-gray-700">{rejectionReason}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left mb-6">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Next steps</p>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Review the rejection reason above</li>
                <li>• Gather any missing documentation</li>
                <li>• Contact support if you have questions</li>
                <li>• Reapply after 30 days with complete information</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/contact"
                className="w-full py-3 px-4 bg-gray-900 text-white font-semibold rounded-xl text-sm text-center hover:bg-gray-800 transition-colors"
              >
                Contact Support
              </Link>
              <Link
                href="/auth/signout"
                className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl text-sm text-center hover:bg-gray-200 transition-colors"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          Account: {session.user.email}
        </p>
      </div>
    </div>
  );
}
