'use client';

interface Stat {
  value: number;
  label: string;
  suffix?: string;
}

interface HeroStatsProps {
  stats: Stat[];
  className?: string;
}

export function HeroStats({ stats, className = '' }: HeroStatsProps) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-8 ${className}`}>
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">
            {stat.value.toLocaleString()}{stat.suffix}
          </div>
          <div className="text-white/80 text-sm font-medium">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
