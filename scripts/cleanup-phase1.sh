#!/bin/bash

# FLY2ANY - Phase 1 Cleanup Script
# Removes 110 orphaned/unused components
# Run with: bash scripts/cleanup-phase1.sh

echo "🧹 FLY2ANY - Phase 1 Cleanup Script"
echo "===================================="
echo ""
echo "This script will DELETE 110 unused files (~25,000 lines of code)"
echo ""
echo "Categories to be deleted:"
echo "  - Blog system (30 components)"
echo "  - Error handling (10 files)"
echo "  - Knowledge base (7 files)"
echo "  - Loading components (5 files)"
echo "  - Search components (20 files)"
echo "  - Conversion components (10 files)"
echo "  - Duplicate components (6 files)"
echo "  - Backup/example files (22 files)"
echo ""
read -p "⚠️  Are you sure you want to proceed? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cleanup cancelled."
    exit 0
fi

echo ""
echo "🗑️  Starting cleanup..."
echo ""

# Track stats
deleted_count=0

# Function to safely delete
safe_delete() {
    if [ -e "$1" ]; then
        rm "$1"
        echo "  ✅ Deleted: $1"
        ((deleted_count++))
    else
        echo "  ⚠️  Not found: $1"
    fi
}

# 1. DELETE BLOG SYSTEM (30 files)
echo "1️⃣  Deleting blog system components..."
safe_delete "components/blog/ArticleContent.tsx"
safe_delete "components/blog/BlogCard.tsx"
safe_delete "components/blog/BlogSearch.tsx"
safe_delete "components/blog/CategoryFilter.tsx"
safe_delete "components/blog/CountdownTimer.tsx"
safe_delete "components/blog/DealExpiryCountdown.tsx"
safe_delete "components/blog/DealRadar.tsx"
safe_delete "components/blog/DynamicMasonryGrid.tsx"
safe_delete "components/blog/FlashDealsCarousel.tsx"
safe_delete "components/blog/HeroSearchBar.tsx"
safe_delete "components/blog/HeroSection.tsx"
safe_delete "components/blog/HeroSlider.tsx"
safe_delete "components/blog/HeroSocialProof.tsx"
safe_delete "components/blog/HeroSplitScreen.tsx"
safe_delete "components/blog/HeroStats.tsx"
safe_delete "components/blog/HeroUrgencyBadge.tsx"
safe_delete "components/blog/LimitedTimeOffer.tsx"
safe_delete "components/blog/LiveViewersCounter.tsx"
safe_delete "components/blog/NewsletterPopup.tsx"
safe_delete "components/blog/NewsTicker.tsx"
safe_delete "components/blog/PopularityIndicator.tsx"
safe_delete "components/blog/PriceDropAlert.tsx"
safe_delete "components/blog/QuickReactions.tsx"
safe_delete "components/blog/RecentBookingsFeed.tsx"
safe_delete "components/blog/RecommendedPosts.tsx"
safe_delete "components/blog/SavedPostsWidget.tsx"
safe_delete "components/blog/SavingsHighlightBadge.tsx"
safe_delete "components/blog/SeatsRemainingBadge.tsx"
safe_delete "components/blog/TrendingDestinationsBadge.tsx"
safe_delete "components/blog/UserReviewsSnippet.tsx"
echo ""

# 2. DELETE ERROR HANDLING (10 files)
echo "2️⃣  Deleting error handling components..."
safe_delete "components/errors/ApiErrorBoundary.tsx"
safe_delete "components/errors/DatabaseErrorBoundary.tsx"
safe_delete "components/errors/ErrorAlert.tsx"
safe_delete "components/errors/ErrorPage.tsx"
safe_delete "components/errors/ErrorToast.tsx"
safe_delete "components/errors/GlobalErrorBoundary.tsx"
safe_delete "lib/errors/api-error-handler.ts"
safe_delete "lib/errors/database-error-handler.ts"
safe_delete "lib/errors/index.ts"
safe_delete "lib/errors/missing-credentials-handler.ts"
echo ""

# 3. DELETE KNOWLEDGE BASE (7 files)
echo "3️⃣  Deleting knowledge base..."
safe_delete "lib/knowledge/flights.ts"
safe_delete "lib/knowledge/hotels.ts"
safe_delete "lib/knowledge/index.ts"
safe_delete "lib/knowledge/legal.ts"
safe_delete "lib/knowledge/query.ts"
safe_delete "lib/knowledge/travel-tips.ts"
safe_delete "lib/knowledge/visa.ts"
echo ""

# 4. DELETE LOADING COMPONENTS (5 files)
echo "4️⃣  Deleting loading components..."
safe_delete "components/loading/ButtonLoading.tsx"
safe_delete "components/loading/LoadingBar.tsx"
safe_delete "components/loading/LoadingOverlay.tsx"
safe_delete "components/loading/LoadingSpinner.tsx"
safe_delete "components/loading/PulseLoader.tsx"
echo ""

# 5. DELETE SEARCH COMPONENTS (20 files)
echo "5️⃣  Deleting unused search components..."
safe_delete "components/search/AirportAutocompleteCompact.backup.tsx"
safe_delete "components/search/AirportAutocompleteCompact.example.backup.tsx"
safe_delete "components/search/BundleSavingsPreview.tsx"
safe_delete "components/search/CompactPricePrediction.tsx"
safe_delete "components/search/EnhancedSearchButton.tsx"
safe_delete "components/search/FlexibleDatesToggle.tsx"
safe_delete "components/search/FlexibleDatesToggleWithLabel.tsx"
safe_delete "components/search/FlightSearchForm.example.tsx"
safe_delete "components/search/MultiCitySearchForm.tsx"
safe_delete "components/search/NearbyAirportSuggestion.tsx"
safe_delete "components/search/PassengerClassSelector.tsx"
safe_delete "components/search/PriceDatePicker.tsx"
safe_delete "components/search/PriceDatePickerEnhanced.tsx"
safe_delete "components/search/PriceFreezeOption.tsx"
safe_delete "components/search/PricePrediction.tsx"
safe_delete "components/search/RewardsPreview.tsx"
safe_delete "components/search/SearchActivityIndicator.tsx"
safe_delete "components/search/SmartFeaturesSidebar.tsx"
safe_delete "components/search/TrackPricesButton.tsx"
safe_delete "components/search/UnifiedLocationAutocomplete.tsx"
echo ""

# 6. DELETE CONVERSION COMPONENTS (10 files)
echo "6️⃣  Deleting unused conversion components..."
safe_delete "components/conversion/AppDownload.tsx"
safe_delete "components/conversion/BookingProgressIndicator.tsx"
safe_delete "components/conversion/CommitmentEscalation.tsx"
safe_delete "components/conversion/CreditCardPointsOptimizer.tsx"
safe_delete "components/conversion/FeaturedRoutes.tsx"
safe_delete "components/conversion/FOMOCountdown.tsx"
safe_delete "components/conversion/PriceDropProtection.tsx"
safe_delete "components/conversion/SocialValidation.tsx"
safe_delete "components/conversion/StatsBar.tsx"
safe_delete "components/conversion/UrgencyBanner.tsx"
echo ""

# 7. DELETE DUPLICATES (6 files)
echo "7️⃣  Deleting duplicate components..."
safe_delete "components/home/Footer.tsx"
safe_delete "components/filters/MobileFilterSheet.tsx"
safe_delete "components/flights/PricePrediction.tsx"
echo ""

# 8. DELETE BACKUP/EXAMPLE FILES (22 files)
echo "8️⃣  Deleting backup and example files..."
find components -name "*.backup.tsx" -type f -delete
find components -name "*.example.tsx" -type f -delete
find lib -name "*.backup.ts" -type f -delete
find lib -name "*.example.ts" -type f -delete
find lib -name "*.demo.ts" -type f -delete
echo ""

# 9. DELETE EMPTY DIRECTORIES
echo "9️⃣  Cleaning up empty directories..."
find components -type d -empty -delete
find lib -type d -empty -delete
echo ""

echo "✅ Cleanup complete!"
echo ""
echo "📊 Summary:"
echo "  Files deleted: $deleted_count"
echo "  Estimated lines removed: ~25,000"
echo ""
echo "🔄 Next steps:"
echo "  1. Run: npm run build"
echo "  2. Test the application"
echo "  3. Commit changes: git add -A && git commit -m 'cleanup: Remove orphaned components (Phase 1)'"
echo "  4. Review: git status"
echo ""
echo "📖 For Phase 2 cleanup, see: MASTER_SYSTEM_ARCHITECTURE.md"
echo ""
