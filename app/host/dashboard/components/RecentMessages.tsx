import { getPrismaClient } from '@/lib/prisma';
import Link from 'next/link';
import { MessageSquare, ArrowRight, User } from 'lucide-react';
import { AnimatedFadeIn } from '@/components/ui/AnimatedFadeIn';

export async function RecentMessages({ userId }: { userId: string }) {
  try {
    const prisma = getPrismaClient();
    const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), ms));

    let conversations: any[] = [];

    await Promise.race([
      (async () => {
        conversations = await prisma.conversation.findMany({
          where: { hostId: userId },
          orderBy: { lastMessageAt: 'desc' },
          take: 4,
          select: {
            id: true,
            lastMessage: true,
            lastMessageAt: true,
            unreadCountHost: true,
            guest: { select: { name: true, image: true } },
            property: { select: { name: true } },
          },
        });
      })(),
      timeout(8000),
    ]);

    const unreadTotal = conversations.reduce((sum, c) => sum + (c.unreadCountHost || 0), 0);

    return (
      <AnimatedFadeIn delay={0.3}>
        <div className="bg-white border border-neutral-100 rounded-[2rem] p-8 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-8 border-b border-neutral-100 pb-5 justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary-50">
                <MessageSquare className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="font-extrabold text-xl tracking-tight text-midnight-navy mb-0.5">Recent Messages</h3>
                <p className="text-sm font-medium text-neutral-400">
                  {unreadTotal > 0 ? `${unreadTotal} unread messages` : 'Inbox zero — nice!'}
                </p>
              </div>
            </div>
            <Link
              href="/host/messages"
              className="text-sm font-bold text-primary-500 hover:text-primary-600 flex items-center gap-1.5 transition-colors bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-xl"
            >
              Inbox <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        {conversations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-6">
            <p className="text-sm text-gray-400 font-medium">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-1 flex-1">
            {conversations.map((conv, i) => {
              const timeAgo = getRelativeTime(conv.lastMessageAt);
              return (
                <AnimatedFadeIn key={conv.id} delay={0.4 + i * 0.1}>
                  <Link
                    href="/host/messages"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors group"
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden">
                        {conv.guest?.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={conv.guest.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      {(conv.unreadCountHost || 0) > 0 && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary-500 ring-4 ring-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-sm font-bold truncate ${(conv.unreadCountHost || 0) > 0 ? 'text-midnight-navy' : 'text-neutral-600'}`}>
                          {conv.guest?.name || 'Guest'}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 ml-2">{timeAgo}</span>
                      </div>
                      <p className={`text-sm truncate ${(conv.unreadCountHost || 0) > 0 ? 'text-midnight-navy font-semibold' : 'text-neutral-500 font-medium'}`}>
                        {conv.lastMessage || 'No messages'}
                      </p>
                    </div>
                  </Link>
                </AnimatedFadeIn>
              );
            })}
          </div>
        )}
      </div>
      </AnimatedFadeIn>
    );
  } catch (e) {
    console.error('RecentMessages Error:', e);
    return null;
  }
}

function getRelativeTime(date: Date | string | null): string {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
