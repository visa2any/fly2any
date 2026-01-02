/**
 * CLIENT ↔ AGENT CO-CREATION
 *
 * Premium collaboration layer that differentiates from
 * Expedia, Decolar, and Booking.
 *
 * VALUE PROPOSITION:
 * Client feels: "This was designed WITH me, not FOR me."
 *
 * ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────┐
 * │                    Client View                       │
 * │  ┌─────────────────────────────────────────────────┐│
 * │  │ Item Card                    [♥] [💬]          ││
 * │  │  └─ ClientReactions (inline)                   ││
 * │  │  └─ ClientSuggestionInput (overlay)           ││
 * │  └─────────────────────────────────────────────────┘│
 * └─────────────────────────────────────────────────────┘
 *                         │
 *                    Suggestions
 *                         ↓
 * ┌─────────────────────────────────────────────────────┐
 * │                    Agent View                        │
 * │  ┌─────────────────────────────────────────────────┐│
 * │  │ AgentSuggestionReview                          ││
 * │  │  ├─ Pending (priority queue)                   ││
 * │  │  ├─ Actions: Acknowledge / Apply / Decline     ││
 * │  │  └─ Handled (collapsed history)                ││
 * │  └─────────────────────────────────────────────────┘│
 * └─────────────────────────────────────────────────────┘
 *
 * SAFEGUARDS:
 * - Suggestions NEVER auto-apply
 * - Agent has full control
 * - No notification overload
 * - Clear status tracking
 *
 * COMPETITIVE ADVANTAGE:
 * - Expedia: No co-creation, transactional only
 * - Booking: No agent involvement
 * - Decolar: Basic, no emotional engagement
 * - FLY2ANY: Premium collaboration experience
 */

// Types
export * from "./types";

// State management
export { useCoCreation } from "./useCoCreation";
export type { CoCreationReturn } from "./useCoCreation";

// Client components
export { default as ClientReactions, ReactionIndicator } from "./ClientReactions";
export { default as ClientSuggestionInput } from "./ClientSuggestionInput";

// Agent components
export { default as AgentSuggestionReview } from "./AgentSuggestionReview";
