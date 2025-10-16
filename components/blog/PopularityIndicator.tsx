'use client';

interface PopularityIndicatorProps {
  popularityScore: number; // 0-100
  label?: string;
}

export default function PopularityIndicator({
  popularityScore,
  label
}: PopularityIndicatorProps) {
  // Clamp score between 0-100
  const score = Math.max(0, Math.min(100, popularityScore));

  // Determine popularity level
  const getPopularityLevel = () => {
    if (score >= 80) return 'hot';
    if (score >= 60) return 'popular';
    if (score >= 40) return 'liked';
    return 'new';
  };

  const level = getPopularityLevel();

  const config = {
    hot: {
      icon: '🔥',
      text: 'HOT DEAL',
      bgGradient: 'from-red-600 to-orange-600',
      textColor: 'text-white',
      pulse: true,
      flame: true,
      particles: 3,
    },
    popular: {
      icon: '⭐',
      text: 'POPULAR',
      bgGradient: 'from-yellow-400 to-orange-500',
      textColor: 'text-gray-900',
      pulse: false,
      flame: false,
      particles: 2,
    },
    liked: {
      icon: '👍',
      text: 'Liked',
      bgGradient: 'from-blue-500 to-blue-600',
      textColor: 'text-white',
      pulse: false,
      flame: false,
      particles: 0,
    },
    new: {
      icon: '✨',
      text: 'New',
      bgGradient: 'from-gray-500 to-gray-600',
      textColor: 'text-white',
      pulse: false,
      flame: false,
      particles: 0,
    },
  }[level];

  // Calculate flame intensity (for hot deals)
  const flameIntensity = Math.min(5, Math.floor((score - 80) / 4) + 1);

  return (
    <div className="relative inline-flex items-center">
      {/* Main badge */}
      <div className={`relative inline-flex items-center gap-2 bg-gradient-to-r ${config.bgGradient} ${config.textColor} px-4 py-2 rounded-full shadow-lg font-bold uppercase tracking-wide ${config.pulse ? 'animate-pulse-glow' : ''}`}>
        {/* Icon with animation */}
        <span className={`text-2xl ${config.flame ? 'animate-flame-pulse' : ''}`}>
          {config.icon}
        </span>

        {/* Multiple flame icons for hot deals */}
        {level === 'hot' && (
          <>
            {Array.from({ length: flameIntensity - 1 }).map((_, i) => (
              <span
                key={i}
                className="text-2xl animate-flame-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {config.icon}
              </span>
            ))}
          </>
        )}

        {/* Text */}
        <span className="text-sm md:text-base">
          {label || config.text}
        </span>

        {/* Live indicator for hot deals */}
        {level === 'hot' && (
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        )}
      </div>

      {/* Sparkle particles */}
      {config.particles > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: config.particles }).map((_, i) => (
            <div
              key={i}
              className="absolute text-yellow-300 text-xs animate-bounce-gentle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.3}s`,
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      {/* Popularity score indicator (optional visual) */}
      {level === 'hot' && (
        <div className="absolute -top-2 -right-2 bg-white text-red-600 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-md border-2 border-red-600 animate-pulse">
          {score}
        </div>
      )}
    </div>
  );
}
