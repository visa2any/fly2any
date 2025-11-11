'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface FaqItemProps {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags?: string[];
  helpful?: number;
  notHelpful?: number;
}

export default function FaqItem({ id, question, answer, category, tags, helpful = 0, notHelpful = 0 }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [voted, setVoted] = useState<'helpful' | 'not-helpful' | null>(null);
  const [helpfulCount, setHelpfulCount] = useState(helpful);
  const [notHelpfulCount, setNotHelpfulCount] = useState(notHelpful);

  const handleVote = (type: 'helpful' | 'not-helpful') => {
    if (voted) {
      toast.error('You have already voted on this question');
      return;
    }

    setVoted(type);
    if (type === 'helpful') {
      setHelpfulCount(prev => prev + 1);
      toast.success('Thanks for your feedback!', { icon: '👍' });
    } else {
      setNotHelpfulCount(prev => prev + 1);
      toast('We will improve this answer', { icon: '📝' });
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/faq#${id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!', { icon: '🔗' });
  };

  return (
    <div id={id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 scroll-mt-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left group"
      >
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
              {category}
            </span>
            {tags && tags.length > 0 && (
              <div className="flex gap-1">
                {tags.slice(0, 2).map((tag, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {question}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-5 animate-fadeIn">
          <div className="pt-4 border-t border-gray-100">
            <div className="prose prose-sm max-w-none text-gray-700 mb-4">
              {answer}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Was this helpful?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVote('helpful')}
                    disabled={voted !== null}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      voted === 'helpful'
                        ? 'bg-green-100 text-green-700'
                        : voted === 'not-helpful'
                        ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                    }`}
                  >
                    👍 Yes ({helpfulCount})
                  </button>
                  <button
                    onClick={() => handleVote('not-helpful')}
                    disabled={voted !== null}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      voted === 'not-helpful'
                        ? 'bg-red-100 text-red-700'
                        : voted === 'helpful'
                        ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                    }`}
                  >
                    👎 No ({notHelpfulCount})
                  </button>
                </div>
              </div>
              <button
                onClick={copyLink}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
