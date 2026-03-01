// app/agent/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  FileText, Plane, Users, TrendingUp, Plus, ArrowUpRight,
  Clock, CheckCircle2, XCircle, Eye, DollarSign, Wallet,
  BarChart3, ChevronRight, Sparkles, Star, Zap, Target,
  BookOpen, Globe, HeadphonesIcon, Award
} from "lucide-react";
import { DEMO_STATS, DEMO_RECENT_QUOTES } from "@/lib/demo/agent-demo-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard — Agent Portal · Fly2Any",
  description: "Travel agent dashboard",
};

const STATUS_CONFIG: Record<string, { label: string; dot: string; icon: typeof CheckCircle2 }> = {
  DRAFT:    { label: "Draft",    dot: "bg-gray-400",    icon: Clock },
  SENT:     { label: "Sent",     dot: "bg-blue-500",    icon: Plane },
  VIEWED:   { label: "Viewed",   dot: "bg-violet-500",  icon: Eye },
  ACCEPTED: { label: "Accepted", dot: "bg-emerald-500", icon: CheckCircle2 },
  DECLINED: { label: "Declined", dot: "bg-red-500",     icon: XCircle },
  EXPIRED:  { label: "Expired",  dot: "bg-amber-400",   icon: Clock },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function fmt(n: number) {
  if (n >= 1000) return `$${(n/1000).toFixed(1)}k`;
  return `$${n.toLocaleString()}`;
}

export default async function AgentDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/agent");

  const isDemo = session.user.id === "demo-agent-001" || session.user.email === "demo@fly2any.com";

  let agent: { id: string; tier: string; businessName: string | null };
  let quotesCount: number;
  let bookingsCount: number;
  let clientsCount: number;
  let totalEarnings: number;
  let pendingEarnings: number;
  let recentQuotes: Array<{
    id: string; tripName: string; status: string;
    total: number; destination: string | null; createdAt?: string;
  }>;

  if (isDemo) {
    agent = { id: "demo-agent-001", tier: "DEMO", businessName: "Demo Travel Agency" };
    quotesCount    = DEMO_STATS.quotesCount;
    bookingsCount  = DEMO_STATS.bookingsCount;
    clientsCount   = DEMO_STATS.clientsCount;
    totalEarnings  = DEMO_STATS.totalEarnings;
    pendingEarnings = 1240;
    recentQuotes   = DEMO_RECENT_QUOTES.map((q) => ({
      id: q.id, tripName: q.tripName, status: q.status,
      total: q.total, destination: q.destination,
    }));
  } else {
    // Agent lookup — distinguish "not found" (redirect) from "DB down" (show empty dashboard)
    let dbAgent: { id: string; tier: string; businessName: string | null; status: string } | null = null;
    let dbError = false;
    try {
      dbAgent = await prisma?.travelAgent.findUnique({
        where: { userId: session.user.id },
        select: { id: true, tier: true, businessName: true, status: true },
      }) ?? null;
    } catch {
      dbError = true; // DB unreachable — avoid redirect loop, show empty dashboard
    }

    if (!dbError && !dbAgent) redirect("/agent/register");

    if (dbError || !dbAgent) {
      // DB unreachable — show empty dashboard rather than crash
      agent = { id: "unknown", tier: "STANDARD", businessName: null };
      quotesCount = 0; bookingsCount = 0; clientsCount = 0;
      totalEarnings = 0; pendingEarnings = 0; recentQuotes = [];
    } else {
      if (dbAgent.status === 'SUSPENDED') redirect("/agent/suspended");
      if (dbAgent.status === 'BANNED' || dbAgent.status === 'INACTIVE') redirect("/agent/rejected");
      agent = { id: dbAgent.id, tier: dbAgent.tier, businessName: dbAgent.businessName };

      // Stats — non-critical, degrade to zeros on DB timeout
      try {
        const [qc, bc, cc, earned, pending, rawQuotes] = await Promise.all([
          prisma?.agentQuote.count({ where: { agentId: agent.id } }) ?? 0,
          prisma?.agentBooking.count({ where: { agentId: agent.id } }) ?? 0,
          prisma?.agentClient.count({ where: { agentId: agent.id, status: { not: "ARCHIVED" } } }) ?? 0,
          prisma?.agentCommission.aggregate({ where: { agentId: agent.id, status: "PAID" }, _sum: { agentEarnings: true } }),
          prisma?.agentCommission.aggregate({ where: { agentId: agent.id, status: { in: ["PENDING","IN_HOLD_PERIOD","AVAILABLE"] } }, _sum: { agentEarnings: true } }),
          prisma?.agentQuote.findMany({
            where: { agentId: agent.id },
            select: { id: true, tripName: true, status: true, total: true, destination: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 5,
          }),
        ]);

        quotesCount     = qc ?? 0;
        bookingsCount   = bc ?? 0;
        clientsCount    = cc ?? 0;
        totalEarnings   = Number(earned?._sum?.agentEarnings) || 0;
        pendingEarnings = Number(pending?._sum?.agentEarnings) || 0;
        recentQuotes    = (rawQuotes ?? []).map((q: any) => ({
          id: String(q.id), tripName: String(q.tripName || "Untitled"),
          status: String(q.status || "DRAFT"), total: Number(q.total) || 0,
          destination: q.destination ? String(q.destination) : null,
          createdAt: q.createdAt ? new Date(q.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : undefined,
        }));
      } catch {
        // Stats unavailable — keep zeros set above, page still renders
        quotesCount = 0; bookingsCount = 0; clientsCount = 0;
        totalEarnings = 0; pendingEarnings = 0; recentQuotes = [];
      }
    } // end else (DB available)
  }

  const greeting = getGreeting();
  const agentName = agent.businessName?.split(" ")[0] || session.user.name?.split(" ")[0] || "Agent";
  const isNew = quotesCount === 0 && bookingsCount === 0;
  const convRate = quotesCount > 0 ? Math.round((recentQuotes.filter(q => q.status === "ACCEPTED").length / Math.min(quotesCount, recentQuotes.length)) * 100) : 0;

  const STATS = [
    { label: "Quotes",  value: quotesCount,    sub: "total created",     icon: FileText,  color: "blue",   href: "/agent/quotes" },
    { label: "Bookings",value: bookingsCount,   sub: "confirmed trips",   icon: Plane,     color: "indigo", href: "/agent/bookings" },
    { label: "Clients", value: clientsCount,    sub: "active clients",    icon: Users,     color: "violet", href: "/agent/clients" },
    { label: "Conv.",   value: `${convRate}%`,  sub: "conversion rate",   icon: Target,    color: "amber",  href: "/agent/quotes/analytics" },
  ];

  const colorMap: Record<string, { bg: string; icon: string; text: string }> = {
    blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   text: "group-hover:text-blue-600" },
    indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", text: "group-hover:text-indigo-600" },
    violet: { bg: "bg-violet-50", icon: "text-violet-600", text: "group-hover:text-violet-600" },
    amber:  { bg: "bg-amber-50",  icon: "text-amber-600",  text: "group-hover:text-amber-600" },
  };

  return (
    <div className="space-y-5 pb-10">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0A0A0A] p-6 shadow-2xl">
        {/* Layered glows */}
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 bg-[#E74035]/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-white/[0.02] rounded-full blur-2xl" />

        {/* Dot grid texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Tier badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full mb-3">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{agent.tier} Agent</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              {greeting}, {agentName}
            </h1>
            <p className="text-sm text-white/40 mt-1">
              {isNew
                ? "Welcome to Fly2Any — let's build your first quote."
                : `${quotesCount} quotes · ${clientsCount} clients · ${fmt(totalEarnings + pendingEarnings)} pipeline`
              }
            </p>
          </div>

          <Link
            href="/agent/quotes/workspace"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-[#E74035] hover:bg-[#D63930] text-white text-sm font-black rounded-xl shadow-lg shadow-[#E74035]/30 transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Quote
          </Link>
        </div>

        {/* Bottom metrics row */}
        <div className="relative mt-5 pt-4 border-t border-white/[0.06] grid grid-cols-3 gap-3">
          {[
            { label: "Total Earned",  value: fmt(totalEarnings),  color: "text-emerald-400" },
            { label: "Pending",       value: fmt(pendingEarnings), color: "text-amber-400" },
            { label: "This Month",    value: "—",                  color: "text-white/70" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className={`text-lg font-black tabular-nums ${color}`} suppressHydrationWarning>{value}</p>
              <p className="text-[10px] text-white/40 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map(({ label, value, sub, icon: Icon, color, href }) => {
          const c = colorMap[color];
          return (
            <Link key={label} href={href}
              className="group bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
                  <Icon className={`w-4.5 h-4.5 ${c.icon}`} />
                </div>
                <ArrowUpRight className={`w-4 h-4 text-gray-200 ${c.text} transition-colors`} />
              </div>
              <p className="text-2xl font-black text-gray-900 tabular-nums" suppressHydrationWarning>{value}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{sub}</p>
            </Link>
          );
        })}
      </div>

      {/* ── Main grid ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Recent Quotes — 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-bold text-gray-900">Recent Quotes</h2>
            </div>
            <Link href="/agent/quotes" className="flex items-center gap-0.5 text-xs font-semibold text-[#E74035] hover:text-[#D63930] transition-colors">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentQuotes.length === 0 ? (
            <div className="py-14 text-center px-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#E74035]/10 to-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-[#E74035]" />
              </div>
              <p className="text-sm font-black text-gray-900 mb-1">Start with your first quote</p>
              <p className="text-xs text-gray-400 mb-4 max-w-xs mx-auto">Build a professional travel quote with flights, hotels and activities in minutes.</p>
              <Link href="/agent/quotes/workspace"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E74035] text-white text-xs font-black rounded-xl shadow-md shadow-[#E74035]/25 hover:bg-[#D63930] transition-all">
                <Plus className="w-3.5 h-3.5" /> Build New Quote
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentQuotes.map((quote) => {
                const cfg = STATUS_CONFIG[quote.status] || STATUS_CONFIG.DRAFT;
                const StatusIcon = cfg.icon;
                return (
                  <Link key={quote.id} href={`/agent/quotes/${quote.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/80 transition-colors group"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <StatusIcon className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#E74035] transition-colors">{quote.tripName}</p>
                      {quote.destination && <p className="text-xs text-gray-400 truncate mt-0.5">{quote.destination}</p>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {quote.createdAt && <span className="hidden sm:block text-[11px] text-gray-400">{quote.createdAt}</span>}
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-100 text-gray-500`}>{cfg.label}</span>
                      <span className="text-sm font-black text-gray-900 tabular-nums" suppressHydrationWarning>
                        ${quote.total.toLocaleString()}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-2 space-y-1">
              {[
                { href:"/agent/quotes/workspace",  icon: FileText,       color:"bg-[#E74035]", label:"Build New Quote",  desc:"Start a quote" },
                { href:"/agent/clients/create",    icon: Users,          color:"bg-violet-500",label:"Add Client",       desc:"New client profile" },
                { href:"/agent/payouts",           icon: Wallet,         color:"bg-emerald-500",label:"View Payouts",    desc:"Check earnings" },
                { href:"/agent/quotes/analytics",  icon: TrendingUp,     color:"bg-blue-500",  label:"Analytics",       desc:"Quote performance" },
                { href:"/agent/commissions",       icon: DollarSign,     color:"bg-amber-500", label:"Commissions",     desc:"Track earnings" },
              ].map(({ href, icon: Icon, color, label, desc }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className={`w-7 h-7 ${color} rounded-lg flex items-center justify-center shrink-0`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800">{label}</p>
                    <p className="text-[10px] text-gray-400">{desc}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Earnings Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 overflow-hidden relative">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#E74035]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold text-white/80">Earnings Pipeline</h2>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: "Paid Out",  value: totalEarnings,   color: "text-emerald-400", dot: "bg-emerald-400" },
                  { label: "Pending",   value: pendingEarnings, color: "text-amber-400",   dot: "bg-amber-400" },
                ].map(({ label, value, color, dot }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      <span className="text-xs text-white/50">{label}</span>
                    </div>
                    <span className={`text-sm font-black tabular-nums ${color}`} suppressHydrationWarning>
                      {fmt(value)}
                    </span>
                  </div>
                ))}

                {/* Progress bar */}
                {(totalEarnings + pendingEarnings) > 0 && (
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (totalEarnings / (totalEarnings + pendingEarnings)) * 100)}%` }}
                    />
                  </div>
                )}

                <Link href="/agent/commissions"
                  className="flex items-center justify-center gap-1.5 w-full py-2 text-[11px] font-bold text-white/40 hover:text-white/70 transition-colors mt-1">
                  View Commissions <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2.5">Resources</h2>
            <div className="space-y-1">
              {[
                { icon: BookOpen,      label: "Agent Handbook",   href: "#" },
                { icon: Globe,         label: "Destination Guides",href: "#" },
                { icon: HeadphonesIcon,label: "24/7 Agent Support",href: "#" },
              ].map(({ icon: Icon, label, href }) => (
                <a key={label} href={href}
                  className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#E74035] transition-colors" />
                  <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">{label}</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-300 ml-auto group-hover:text-gray-500 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── New agent onboarding checklist ── */}
      {isNew && (
        <div className="bg-gradient-to-r from-[#E74035]/5 to-indigo-500/5 border border-[#E74035]/10 rounded-2xl p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <Sparkles className="w-4 h-4 text-[#E74035]" />
            <h2 className="text-sm font-black text-gray-900">Get started checklist</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { step: "01", title: "Create your first quote", desc: "Build a professional travel quote for a client", href: "/agent/quotes/workspace", cta: "Start now" },
              { step: "02", title: "Add your first client", desc: "Import or create a client profile to organize bookings", href: "/agent/clients/create", cta: "Add client" },
              { step: "03", title: "Set up payouts", desc: "Connect your bank account to receive commissions", href: "/agent/payouts", cta: "Setup payouts" },
            ].map(({ step, title, desc, href, cta }) => (
              <Link key={step} href={href}
                className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all group"
              >
                <span className="text-[10px] font-black text-[#E74035] tracking-widest">{step}</span>
                <p className="text-xs font-bold text-gray-900 mt-1">{title}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                <p className="flex items-center gap-1 text-[11px] font-bold text-[#E74035] mt-2.5 group-hover:gap-1.5 transition-all">
                  {cta} <ChevronRight className="w-3 h-3" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
