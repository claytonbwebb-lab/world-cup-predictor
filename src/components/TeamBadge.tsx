'use client';

interface TeamBadgeProps {
  value: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

export default function TeamBadge({ value, size = 'md', className = '' }: TeamBadgeProps) {
  if (!value) {
    return (
      <span className={`${sizeClasses[size]} flex items-center justify-center text-lg`}>
        🏳️
      </span>
    );
  }

  // Handle both absolute URLs (http://, https://) and relative paths (/badges/...)
  const isUrl = value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/');

  if (isUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-surfaceLight flex items-center justify-center shrink-0`}>
        <img
          src={value}
          alt=""
          className={`object-contain w-3/4 h-3/4`}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Emoji fallback
  return (
    <span className={`${sizeClasses[size]} flex items-center justify-center text-xl`}>
      {value}
    </span>
  );
}
