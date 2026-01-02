// Unified Multi-Search System
// Single search action → parallel product queries → progressive results

export { useUnifiedSearch, type SearchScope, type SearchStatus, type ProductSearchState, type UnifiedSearchState } from "./useUnifiedSearch";
export { UnifiedSearchProvider, useUnifiedSearchContext, useUnifiedSearchSafe } from "./UnifiedSearchProvider";
export { default as SearchScopeSelector, TabResultIndicator, SearchStatusBar } from "./SearchScopeSelector";
