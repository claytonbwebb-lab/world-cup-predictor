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

  if (value.startsWith('http')) {
    return (
      <img
        src={value}
        alt=""
        className={`${sizeClasses[size]} object-contain rounded`}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }

  // Emoji fallback
  return (
    <span className={`${sizeClasses[size]} flex items-center justify-center text-xl`}>
      {value}
    </span>
  );
}