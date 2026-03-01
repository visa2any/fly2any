import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Account Suspended - Fly2Any Agent Portal",
};

export default async function AgentSuspendedPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/agent");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Red header bar */}
          <div className="h-2 bg-gradient-to-r from-red-500 to-rose-600" />
          <div className="p-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Suspended</h1>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Your Fly2Any agent account has been temporarily suspended. During this period, you cannot access the agent portal or create quotes.
            </p>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-left mb-6">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">What you can do</p>
              <ul className="text-sm text-red-600 space-y-1">
                <li>• Contact support to understand the reason</li>
                <li>• Appeal the decision if you believe it was in error</li>
                <li>• Provide any requested documentation</li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/contact"
                className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-xl text-sm text-center hover:opacity-90 transition-opacity"
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
