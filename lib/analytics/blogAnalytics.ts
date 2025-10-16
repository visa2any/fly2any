'use client';

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export interface PostViewEvent {
  postId: string;
  postTitle: string;
  postCategory?: string;
  timestamp: number;
}

export interface PostInteractionEvent {
  postId: string;
  postTitle: string;
  interactionType: 'like' | 'save' | 'share' | 'click';
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface DealClickEvent {
  dealId: string;
  dealTitle: string;
  dealPrice?: number;
  dealDestination?: string;
  timestamp: number;
}

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Generic analytics tracking function
 */
const trackEvent = (event: AnalyticsEvent): void => {
  // Log to console in development
  if (isDevelopment) {
    console.log('[Analytics Event]', {
      category: event.category,
      action: event.action,
      label: event.label,
      value: event.value,
      metadata: event.metadata,
      timestamp: new Date().toISOString(),
    });
  }

  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.metadata,
    });
  }

  // Send to Facebook Pixel if available
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackCustom', event.action, {
      category: event.category,
      label: event.label,
      ...event.metadata,
    });
  }

  // You can add other analytics providers here (Mixpanel, Amplitude, etc.)
};

/**
 * Track post view
 */
export const trackPostView = (
  postId: string,
  postTitle: string,
  postCategory?: string
): void => {
  trackEvent({
    category: 'Blog',
    action: 'post_view',
    label: postTitle,
    metadata: {
      post_id: postId,
      post_category: postCategory,
      timestamp: Date.now(),
    },
  });

  // Store in localStorage for later analysis
  if (typeof window !== 'undefined') {
    try {
      const views = localStorage.getItem('fly2any_post_views');
      const viewsArray: PostViewEvent[] = views ? JSON.parse(views) : [];

      viewsArray.push({
        postId,
        postTitle,
        postCategory,
        timestamp: Date.now(),
      });

      // Keep only last 100 views
      const recentViews = viewsArray.slice(-100);
      localStorage.setItem('fly2any_post_views', JSON.stringify(recentViews));
    } catch (error) {
      console.error('Error storing post view:', error);
    }
  }
};

/**
 * Track post like
 */
export const trackPostLike = (
  postId: string,
  postTitle: string,
  isLiked: boolean
): void => {
  trackEvent({
    category: 'Blog',
    action: isLiked ? 'post_like' : 'post_unlike',
    label: postTitle,
    value: isLiked ? 1 : 0,
    metadata: {
      post_id: postId,
      timestamp: Date.now(),
    },
  });
};

/**
 * Track post save/bookmark
 */
export const trackPostSave = (
  postId: string,
  postTitle: string,
  isSaved: boolean
): void => {
  trackEvent({
    category: 'Blog',
    action: isSaved ? 'post_save' : 'post_unsave',
    label: postTitle,
    value: isSaved ? 1 : 0,
    metadata: {
      post_id: postId,
      timestamp: Date.now(),
    },
  });
};

/**
 * Track post share
 */
export const trackPostShare = (
  postId: string,
  postTitle: string,
  platform: string
): void => {
  trackEvent({
    category: 'Blog',
    action: 'post_share',
    label: postTitle,
    metadata: {
      post_id: postId,
      platform,
      timestamp: Date.now(),
    },
  });
};

/**
 * Track deal click
 */
export const trackDealClick = (
  dealId: string,
  dealTitle: string,
  dealPrice?: number,
  dealDestination?: string
): void => {
  trackEvent({
    category: 'Deals',
    action: 'deal_click',
    label: dealTitle,
    value: dealPrice,
    metadata: {
      deal_id: dealId,
      destination: dealDestination,
      timestamp: Date.now(),
    },
  });

  // Store in localStorage for conversion tracking
  if (typeof window !== 'undefined') {
    try {
      const clicks = localStorage.getItem('fly2any_deal_clicks');
      const clicksArray: DealClickEvent[] = clicks ? JSON.parse(clicks) : [];

      clicksArray.push({
        dealId,
        dealTitle,
        dealPrice,
        dealDestination,
        timestamp: Date.now(),
      });

      // Keep only last 50 clicks
      const recentClicks = clicksArray.slice(-50);
      localStorage.setItem('fly2any_deal_clicks', JSON.stringify(recentClicks));
    } catch (error) {
      console.error('Error storing deal click:', error);
    }
  }
};

/**
 * Track search query
 */
export const trackSearch = (query: string, resultsCount: number): void => {
  trackEvent({
    category: 'Search',
    action: 'search_query',
    label: query,
    value: resultsCount,
    metadata: {
      timestamp: Date.now(),
    },
  });
};

/**
 * Track category filter
 */
export const trackCategoryFilter = (category: string): void => {
  trackEvent({
    category: 'Blog',
    action: 'filter_category',
    label: category,
    metadata: {
      timestamp: Date.now(),
    },
  });
};

/**
 * Track page view
 */
export const trackPageView = (pagePath: string, pageTitle: string): void => {
  trackEvent({
    category: 'Page',
    action: 'page_view',
    label: pageTitle,
    metadata: {
      page_path: pagePath,
      timestamp: Date.now(),
    },
  });

  // Send to Google Analytics pageview
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
};

/**
 * Track user engagement time
 */
export const trackEngagementTime = (
  postId: string,
  timeSpent: number
): void => {
  trackEvent({
    category: 'Engagement',
    action: 'time_on_page',
    label: postId,
    value: timeSpent,
    metadata: {
      timestamp: Date.now(),
    },
  });
};

/**
 * Track newsletter signup
 */
export const trackNewsletterSignup = (email: string): void => {
  trackEvent({
    category: 'Conversion',
    action: 'newsletter_signup',
    metadata: {
      timestamp: Date.now(),
    },
  });
};

/**
 * Track external link click
 */
export const trackExternalLink = (url: string, label?: string): void => {
  trackEvent({
    category: 'External',
    action: 'external_link_click',
    label: label || url,
    metadata: {
      url,
      timestamp: Date.now(),
    },
  });
};

/**
 * Track scroll depth
 */
export const trackScrollDepth = (
  postId: string,
  depth: number
): void => {
  trackEvent({
    category: 'Engagement',
    action: 'scroll_depth',
    label: postId,
    value: depth,
    metadata: {
      timestamp: Date.now(),
    },
  });
};

/**
 * Get analytics summary from localStorage
 */
export const getAnalyticsSummary = (): {
  totalPostViews: number;
  totalDealClicks: number;
  recentPosts: PostViewEvent[];
  recentDeals: DealClickEvent[];
} => {
  if (typeof window === 'undefined') {
    return {
      totalPostViews: 0,
      totalDealClicks: 0,
      recentPosts: [],
      recentDeals: [],
    };
  }

  try {
    const views = localStorage.getItem('fly2any_post_views');
    const clicks = localStorage.getItem('fly2any_deal_clicks');

    const recentPosts: PostViewEvent[] = views ? JSON.parse(views) : [];
    const recentDeals: DealClickEvent[] = clicks ? JSON.parse(clicks) : [];

    return {
      totalPostViews: recentPosts.length,
      totalDealClicks: recentDeals.length,
      recentPosts,
      recentDeals,
    };
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    return {
      totalPostViews: 0,
      totalDealClicks: 0,
      recentPosts: [],
      recentDeals: [],
    };
  }
};

/**
 * Clear analytics data
 */
export const clearAnalyticsData = (): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('fly2any_post_views');
      localStorage.removeItem('fly2any_deal_clicks');
    } catch (error) {
      console.error('Error clearing analytics data:', error);
    }
  }
};

export default {
  trackPostView,
  trackPostLike,
  trackPostSave,
  trackPostShare,
  trackDealClick,
  trackSearch,
  trackCategoryFilter,
  trackPageView,
  trackEngagementTime,
  trackNewsletterSignup,
  trackExternalLink,
  trackScrollDepth,
  getAnalyticsSummary,
  clearAnalyticsData,
};
