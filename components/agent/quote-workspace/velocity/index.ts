// ============================================
// VELOCITY UX - Agent Workspace Optimization
// Apple-Class Speed & Flow
// ============================================

// Keyboard Shortcuts
export { useAgentShortcuts, useItemShortcuts, formatShortcut, SHORTCUT_MAP } from "./useAgentShortcuts";

// Smart Presets
export { default as SmartPresets, QUOTE_PRESETS, useCurrentPreset } from "./SmartPresets";
export type { QuotePreset } from "./SmartPresets";

// Quick Actions
export { QuickActions, useItemQuickActions, useDayQuickActions, FloatingActionBar } from "./QuickActions";

// Autosave & Status
export { default as AutosaveIndicator, SaveToast } from "./AutosaveIndicator";

// Command Palette
export { default as CommandPalette } from "./CommandPalette";

// Shortcuts Overlay
export { default as ShortcutsOverlay } from "./ShortcutsOverlay";
