'use client';

export function TrustBadges() {
  const badges = [
    { icon: '🔒', text: 'SSL Secure', subtext: '256-bit encryption' },
    { icon: '✓', text: 'Verified', subtext: 'BBB Accredited' },
    { icon: '💳', text: 'Safe Payment', subtext: 'PCI Compliant' },
    { icon: '⭐', text: '4.8/5 Rating', subtext: 'From 50K+ reviews' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
      {badges.map((badge, index) => (
        <div
          key={index}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <span className="text-2xl">{badge.icon}</span>
          <div className="text-left">
            <div className="text-sm font-bold">{badge.text}</div>
            <div className="text-xs text-gray-600">{badge.subtext}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
