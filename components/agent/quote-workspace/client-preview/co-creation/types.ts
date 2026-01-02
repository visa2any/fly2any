/**
 * CLIENT ↔ AGENT CO-CREATION TYPES
 * Premium collaboration without friction
 */

export type ReactionType = "love" | "maybe" | "alternative";

export interface ClientReaction {
  id: string;
  itemId: string;
  type: ReactionType;
  timestamp: string;
  clientId: string;
}

export interface ClientSuggestion {
  id: string;
  itemId: string;
  dayIndex: number;
  type: "alternative" | "comment" | "question" | "preference";
  content: string;
  timestamp: string;
  clientId: string;
  clientName: string;
  status: "pending" | "acknowledged" | "applied" | "declined";
  agentResponse?: string;
  agentResponseAt?: string;
}

export interface CoCreationState {
  reactions: Record<string, ReactionType>; // itemId -> reaction
  suggestions: ClientSuggestion[];
  isClientMode: boolean; // vs agent viewing
  showSuggestionInput: string | null; // itemId being commented
  unreadCount: number;
}

export interface CoCreationStats {
  totalReactions: number;
  loved: number;
  suggestions: number;
  pending: number;
}

// Visual config for reactions
export const REACTION_CONFIG = {
  love: {
    icon: "Heart",
    label: "Love this",
    color: "text-rose-500",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
  },
  maybe: {
    icon: "HelpCircle",
    label: "Have a question",
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  alternative: {
    icon: "RefreshCw",
    label: "Suggest alternative",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
} as const;

// Suggestion type labels
export const SUGGESTION_LABELS = {
  alternative: "I'd prefer something different",
  comment: "A thought to share",
  question: "Quick question",
  preference: "Personal preference",
} as const;
