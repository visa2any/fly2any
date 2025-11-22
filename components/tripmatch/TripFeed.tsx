'use client';

/**
 * TripFeed Component
 *
 * Social feed for trip posts with reactions and comments
 * Features: Create post, react, comment, media upload
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, ThumbsUp, Flame,
  Smile, Laugh, Image as ImageIcon, Send, MapPin, X
} from 'lucide-react';

interface Post {
  id: string;
  tripId: string;
  userId: string;
  content: string;
  mediaUrls: string[];
  mediaType: string;
  location: string;
  reactionsCount: number;
  commentsCount: number;
  createdAt: string;
  profile: {
    displayName: string;
    avatarUrl: string;
    userId: string;
    verificationLevel: number;
  };
  reactions: Array<{
    id: string;
    reactionType: string;
    userId: string;
  }>;
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    profile: {
      displayName: string;
      avatarUrl: string;
    };
  }>;
  _count: {
    reactions: number;
    comments: number;
  };
}

interface TripFeedProps {
  tripId: string;
}

const reactionIcons: Record<string, any> = {
  like: ThumbsUp,
  love: Heart,
  fire: Flame,
  haha: Laugh,
  wow: Smile,
};

export default function TripFeed({ tripId }: TripFeedProps) {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [posting, setPosting] = useState(false);

  const currentUserId = session?.user?.id;

  useEffect(() => {
    fetchPosts();
  }, [tripId]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tripmatch/trips/${tripId}/posts?limit=20`);
      const data = await res.json();

      if (data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPostContent.trim() || posting) return;

    try {
      setPosting(true);
      const res = await fetch(`/api/tripmatch/trips/${tripId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPostContent.trim(),
          postType: 'update',
        }),
      });

      const data = await res.json();

      if (data.success) {
        setPosts([data.data, ...posts]);
        setNewPostContent('');
        setShowNewPost(false);
      } else {
        alert(data.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const toggleReaction = async (postId: string, reactionType: string) => {
    try {
      // Optimistically update UI
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const hasReacted = post.reactions.some(r => r.userId === currentUserId);

      if (hasReacted) {
        // Remove reaction
        await fetch(`/api/tripmatch/posts/${postId}/reactions`, { method: 'DELETE' });
        setPosts(posts.map(p =>
          p.id === postId
            ? {
                ...p,
                reactions: p.reactions.filter(r => r.userId !== currentUserId),
                reactionsCount: p.reactionsCount - 1,
              }
            : p
        ));
      } else {
        // Add reaction
        await fetch(`/api/tripmatch/posts/${postId}/reactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reactionType }),
        });

        if (currentUserId) {
          setPosts(posts.map(p =>
            p.id === postId
              ? {
                  ...p,
                  reactions: [...p.reactions, { id: 'temp', reactionType, userId: currentUserId }],
                  reactionsCount: p.reactionsCount + 1,
                }
              : p
          ));
        }
      }
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!content.trim()) return;

    try {
      const res = await fetch(`/api/tripmatch/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        // Update post with new comment
        setPosts(posts.map(p =>
          p.id === postId
            ? {
                ...p,
                comments: [...p.comments, data.data],
                commentsCount: p.commentsCount + 1,
              }
            : p
        ));
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d`;

    return date.toLocaleDateString();
  };

  // Show auth loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-2"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Require authentication
  if (status === 'unauthenticated' || !session) {
    return (
      <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700 p-8">
        <p className="text-gray-300 mb-4">Please sign in to view and create posts</p>
        <button
          onClick={() => window.location.href = '/auth/signin'}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create Post Button */}
      {!showNewPost && (
        <button
          onClick={() => setShowNewPost(true)}
          className="w-full p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-purple-500 transition text-left text-gray-400"
        >
          Share an update, photo, or memory...
        </button>
      )}

      {/* Create Post Form */}
      <AnimatePresence>
        {showNewPost && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-800 rounded-lg border border-slate-700 p-4"
          >
            <div className="flex items-start gap-3 mb-3">
              <img
                src={session?.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.name || 'User'}`}
                alt="You"
                className="w-10 h-10 rounded-full"
              />
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share your experience..."
                className="flex-1 bg-slate-900 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-700 rounded-lg transition text-gray-400">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-slate-700 rounded-lg transition text-gray-400">
                  <MapPin className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewPost(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createPost}
                  disabled={!newPostContent.trim() || posting}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {posting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">No posts yet</p>
          <p className="text-sm">Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onReact={toggleReaction}
              onComment={addComment}
              formatTime={formatTime}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({
  post,
  currentUserId,
  onReact,
  onComment,
  formatTime,
}: {
  post: Post;
  currentUserId: string | undefined;
  onReact: (postId: string, reactionType: string) => void;
  onComment: (postId: string, content: string) => void;
  formatTime: (date: string) => string;
}) {
  const { data: session } = useSession();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const hasReacted = post.reactions.some(r => r.userId === currentUserId);

  const handleComment = () => {
    if (!commentText.trim()) return;
    onComment(post.id, commentText);
    setCommentText('');
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      {/* Post Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.profile.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + post.profile.displayName}
            alt={post.profile.displayName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h4 className="font-semibold text-white">{post.profile.displayName}</h4>
            <p className="text-sm text-gray-400">{formatTime(post.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-200">{post.content}</p>
        {post.location && (
          <div className="flex items-center gap-1 text-sm text-gray-400 mt-2">
            <MapPin className="w-4 h-4" />
            {post.location}
          </div>
        )}
      </div>

      {/* Post Media */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-1 mb-3">
          {post.mediaUrls.slice(0, 4).map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt="Post media"
              className="w-full h-48 object-cover rounded"
            />
          ))}
        </div>
      )}

      {/* Reactions & Comments Count */}
      <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-400 border-t border-slate-700">
        <div className="flex items-center gap-1">
          {post.reactionsCount > 0 && (
            <span>{post.reactionsCount} {post.reactionsCount === 1 ? 'reaction' : 'reactions'}</span>
          )}
        </div>
        <div>
          {post.commentsCount > 0 && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="hover:underline"
            >
              {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 flex gap-2 border-t border-slate-700">
        <button
          onClick={() => onReact(post.id, 'like')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
            hasReacted
              ? 'bg-purple-600/20 text-purple-400'
              : 'hover:bg-slate-700 text-gray-400'
          }`}
        >
          <ThumbsUp className={`w-5 h-5 ${hasReacted ? 'fill-current' : ''}`} />
          Like
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-slate-700 text-gray-400 transition"
        >
          <MessageCircle className="w-5 h-5" />
          Comment
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-700"
          >
            {/* Existing Comments */}
            {post.comments && post.comments.length > 0 && (
              <div className="p-4 space-y-3">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2">
                    <img
                      src={comment.profile.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + comment.profile.displayName}
                      alt={comment.profile.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 bg-slate-900 rounded-lg p-2">
                      <p className="text-sm font-semibold text-white">{comment.profile.displayName}</p>
                      <p className="text-sm text-gray-300">{comment.content}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTime(comment.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment */}
            <div className="p-4 flex items-center gap-2">
              <img
                src={session?.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.name || 'User'}`}
                alt="You"
                className="w-8 h-8 rounded-full"
              />
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                placeholder="Write a comment..."
                className="flex-1 bg-slate-900 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                className="p-2 text-purple-500 hover:bg-slate-700 rounded-full transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
