// app/agent/register/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import AgentRegistrationForm from "@/components/agent/AgentRegistrationForm";
import { DollarSign, Zap, Clock, Users, TrendingUp, Shield, Star } from "lucide-react";

export const metadata = {
  title: "Join as Travel Agent - Fly2Any",
  description: "Join Fly2Any's travel agent program and start earning competitive commissions",
};

const TIERS = [
  { name: "Independent",    fee: "10–30%", clients: "Any",       popular: false },
  { name: "Professional",   fee: "10–30%", clients: "Any",       popular: true  },
  { name: "Agency Partner", fee: "10–30%", clients: "Any",       popular: false },
  { name: "White Label",    fee: "10–30%", clients: "Unlimited", popular: false },
];

const BENEFITS = [
  { icon: DollarSign, label: "100% markup yours",      color: "bg-emerald-500" },
  { icon: Zap,        label: "Wholesale net pricing",  color: "bg-blue-500"    },
  { icon: Clock,      label: "Approved in 24–48h",     color: "bg-amber-500"   },
  { icon: Users,      label: "1,200+ active agents",   color: "bg-violet-500"  },
];

export default async function AgentRegisterPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/agent/register");

  const existingAgent = await prisma!.travelAgent.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (existingAgent) redirect("/agent");

  return (
    <div className="h-screen flex overflow-hidden">

      {/* ─────────── LEFT HERO PANEL ─────────── */}
      <aside className="hidden lg:flex flex-col w-[48%] xl:w-[46%] h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Orbs */}
        <div className="pointer-events-none absolute -top-16 -left-16 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col h-full px-8 xl:px-10 py-7 xl:py-8">
          {/* Logo */}
          <Link href="/" className="flex flex-col gap-1 mb-7">
            <Image src="/logo-transparent.png" alt="Fly2Any" width={130} height={39}
              className="w-[130px] h-auto brightness-0 invert drop-shadow-lg" priority />
            <span className="text-white/60 text-[10px] font-bold tracking-widest uppercase pl-0.5">
              Agent Partner Program
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Free to Join · No Monthly Fees</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight">
              Become a<br />
              <span className="text-primary-400">Travel Agent</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2.5 leading-relaxed max-w-xs">
              Set your own rates on wholesale net prices. Keep 100% of your markup — pay only when you book.
            </p>
          </div>

          {/* Benefits 2×2 */}
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            {BENEFITS.map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2 p-2.5 bg-white/5 rounded-xl border border-white/8">
                <div className={`w-7 h-7 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-white/85 text-xs font-medium leading-tight">{label}</span>
              </div>
            ))}
          </div>

          {/* Earning model */}
          <div className="mb-6">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">
              How You Earn
            </p>
            <div className="rounded-xl overflow-hidden border border-white/10">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5">
                    <th className="text-left py-1.5 px-3 text-gray-400 text-[10px] font-semibold uppercase tracking-wide">Tier</th>
                    <th className="text-center py-1.5 px-3 text-gray-400 text-[10px] font-semibold uppercase tracking-wide">Your Markup</th>
                    <th className="text-right py-1.5 px-3 text-gray-400 text-[10px] font-semibold uppercase tracking-wide">Clients</th>
                  </tr>
                </thead>
                <tbody>
                  {TIERS.map((t) => (
                    <tr key={t.name} className={`border-t border-white/5 ${t.popular ? "bg-primary-500/10" : ""}`}>
                      <td className="py-1.5 px-3">
                        <span className={`text-xs font-semibold ${t.popular ? "text-primary-300" : "text-white/75"}`}>
                          {t.name}
                          {t.popular && (
                            <span className="ml-1.5 text-[9px] bg-primary-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                              Popular
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        <span className="text-emerald-400 text-xs font-bold">{t.fee}</span>
                      </td>
                      <td className="py-1.5 px-3 text-right">
                        <span className="text-gray-400 text-xs">{t.clients}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-gray-500 text-[10px] mt-1.5">Wholesale net rates · You set the final price · 100% yours</p>
          </div>

          {/* Trust signals — pinned to bottom */}
          <div className="mt-auto space-y-2">
            {[
              { icon: TrendingUp, text: "Agents avg. $2,400/mo at 15 bookings" },
              { icon: Shield,     text: "Free signup · Pay only when you book"  },
              { icon: Star,       text: "95% agent retention · Weekly payouts"  },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-gray-500">
                <Icon className="w-3 h-3 flex-shrink-0" />
                <span className="text-[11px]">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ─────────── RIGHT FORM PANEL ─────────── */}
      <main className="flex-1 grid grid-rows-[auto_1fr] overflow-hidden bg-gray-50" style={{height:'100%'}}>

        {/* Mobile-only top bar */}
        <div className="lg:hidden flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100">
          <Link href="/">
            <Image src="/logo-transparent.png" alt="Fly2Any" width={90} height={27} className="w-[90px] h-auto" />
          </Link>
          <span className="text-xs text-gray-500 font-semibold">Agent Registration</span>
        </div>

        {/* Desktop compact header */}
        <div className="hidden lg:flex items-center gap-3 px-8 xl:px-10 py-3 bg-white border-b border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-900 leading-none">Join the Agent Program</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Takes ~5 minutes · Approval in 24–48 hours</p>
          </div>
          <div className="ml-auto text-[10px] text-gray-400 text-right">
            <a href="/terms" className="text-primary-600 hover:underline">Terms</a>
            <span className="mx-1">·</span>
            <a href="/privacy" className="text-primary-600 hover:underline">Privacy</a>
          </div>
        </div>

        {/* Form — fills remaining height (grid 1fr row) */}
        <div className="overflow-hidden flex flex-col px-6 lg:px-8 xl:px-10 py-3">
          <AgentRegistrationForm user={session.user} />
        </div>
      </main>
    </div>
  );
}
