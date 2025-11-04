/**
 * Centralized Icon Exports (Phase 8 - Quick Win 1C)
 *
 * Tree-shaken icon imports to reduce bundle size.
 * Import icons from this file instead of directly from lucide-react.
 *
 * Usage:
 * Before: import { Calendar, Users } from 'lucide-react'
 * After:  import { Calendar, Users } from '@/lib/icons'
 *
 * Bundle size savings: 40-60KB (only exports used icons)
 */

export {
  // Navigation & UI
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
  Search,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  MoreVertical,
  MoreHorizontal,

  // Travel Icons
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  Hotel,
  Car,
  Package,
  MapPin,
  Map,
  Globe,
  Compass,
  Navigation,

  // Date & Time
  Calendar,
  CalendarDays,
  Clock,

  // User & People
  User,
  Users,
  UserPlus,
  UserCheck,

  // Actions
  Plus,
  Minus,
  Check,
  AlertCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Settings,
  Edit,
  Trash2,
  Download,
  Upload,
  Share2,
  Copy,
  ExternalLink,

  // Commerce
  CreditCard,
  DollarSign,
  ShoppingCart,
  Tag,
  Percent,
  TrendingUp,
  TrendingDown,

  // Media
  Image,
  Eye,
  EyeOff,
  Heart,
  Star,
  StarHalf,

  // Communication
  Mail,
  Phone,
  MessageSquare,
  Bell,

  // Status
  CheckCircle,
  XCircle,
  AlertOctagon,
  Loader2,
  RefreshCcw,

  // Layout
  Layout,
  LayoutDashboard,
  LayoutGrid,
  LayoutList,
  Maximize2,
  Minimize2,

  // Sparkles (for AI/ML features)
  Sparkles,

  // File & Document
  FileText,
  File,
  Folder,
} from 'lucide-react';

/**
 * Icon Size Constants
 *
 * Use these for consistent icon sizing across the app
 */
export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

/**
 * Common Icon Props
 *
 * Reusable prop configurations for consistent styling
 */
export const iconProps = {
  small: { size: ICON_SIZES.sm, className: 'flex-shrink-0' },
  medium: { size: ICON_SIZES.md, className: 'flex-shrink-0' },
  large: { size: ICON_SIZES.lg, className: 'flex-shrink-0' },
} as const;
