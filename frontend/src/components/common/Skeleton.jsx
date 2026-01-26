import React from 'react';

const Skeleton = ({ className = '', variant = 'text', count = 1 }) => {
  const baseClass = 'animate-pulse bg-gray-200 dark:bg-gray-700';

  const variants = {
    text: 'h-4 rounded',
    title: 'h-8 rounded',
    circle: 'rounded-full',
    rectangle: 'rounded-lg',
    card: 'h-48 rounded-xl',
    avatar: 'w-12 h-12 rounded-full',
  };

  const skeletonClass = `${baseClass} ${variants[variant]} ${className}`;

  if (count === 1) {
    return <div className={skeletonClass}></div>;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClass}></div>
      ))}
    </div>
  );
};

// Predefined skeleton patterns
export const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton variant="avatar" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-1/3" />
        <Skeleton className="w-1/2" />
      </div>
    </div>
    <Skeleton variant="text" count={3} />
    <div className="flex gap-2">
      <Skeleton className="w-20 h-8" />
      <Skeleton className="w-20 h-8" />
    </div>
  </div>
);

export const SkeletonList = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-3">
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} variant="title" className="h-6" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;
