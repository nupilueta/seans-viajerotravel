import React from 'react';
import { cn } from '@/lib/utils';

export default function ProgressRing({ value = 0, size = 48, strokeWidth = 4, className }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const color = value >= 80 ? 'text-emerald-500' : value >= 50 ? 'text-primary' : value >= 25 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-700 ease-out", color.replace('text-', 'stroke-'))}
        />
      </svg>
      <span className={cn("absolute text-xs font-semibold", color)}>{Math.round(value)}%</span>
    </div>
  );
}