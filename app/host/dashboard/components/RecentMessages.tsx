import { getPrismaClient } from '@/lib/prisma';
import Link from 'next/link';
import { MessageSquare, ArrowRight, User } from 'lucide-react';

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
      <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-50">
              <MessageSquare className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Recent Messages</h3>
              <p className="text-xs text-gray-400">
                {unreadTotal > 0 ? `${unreadTotal} unread` : 'All caught up'}
              </p>
            </div>
          </div>
          <Link
            href="/host/messages"
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {conversations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-6">
            <p className="text-sm text-gray-400 font-medium">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-1 flex-1">
            {conversations.map((conv) => {
              const timeAgo = getRelativeTime(conv.lastMessageAt);
              return (
                <Link
                  key={conv.id}
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
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-sm font-semibold truncate ${(conv.unreadCountHost || 0) > 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                        {conv.guest?.name || 'Guest'}
                      </span>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{timeAgo}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{conv.lastMessage || 'No messages'}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
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
