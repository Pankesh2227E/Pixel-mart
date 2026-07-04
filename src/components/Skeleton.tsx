import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden p-4 space-y-3 animate-pulse">
      {/* Image skeleton */}
      <div className="bg-neutral-100 aspect-square w-full rounded-xl"></div>
      
      {/* Category skeleton */}
      <div className="h-3 bg-neutral-100 rounded w-1/4"></div>
      
      {/* Title skeleton */}
      <div className="h-4 bg-neutral-100 rounded w-3/4"></div>
      
      {/* Rating skeleton */}
      <div className="flex items-center space-x-1">
        <div className="h-3 bg-neutral-100 rounded w-12"></div>
        <div className="h-3 bg-neutral-100 rounded w-8"></div>
      </div>
      
      {/* Footer skeleton */}
      <div className="flex justify-between items-center pt-2">
        <div className="h-5 bg-neutral-100 rounded w-16"></div>
        <div className="h-8 w-8 bg-neutral-100 rounded-full"></div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 animate-pulse space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Gallery skeleton */}
        <div className="space-y-4">
          <div className="bg-neutral-100 aspect-square w-full rounded-2xl"></div>
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-neutral-100 aspect-square rounded-lg"></div>
            ))}
          </div>
        </div>
        
        {/* Right: Info skeleton */}
        <div className="space-y-6 pt-4">
          <div className="space-y-3">
            <div className="h-4 bg-neutral-100 rounded w-1/4"></div>
            <div className="h-8 bg-neutral-100 rounded w-3/4"></div>
            <div className="h-5 bg-neutral-100 rounded w-1/3"></div>
          </div>
          
          <div className="h-px bg-neutral-100 my-4"></div>
          
          <div className="space-y-2">
            <div className="h-3 bg-neutral-100 rounded w-full"></div>
            <div className="h-3 bg-neutral-100 rounded w-5/6"></div>
            <div className="h-3 bg-neutral-100 rounded w-4/6"></div>
          </div>
          
          <div className="space-y-3 pt-4">
            <div className="h-4 bg-neutral-100 rounded w-1/4"></div>
            <div className="flex space-x-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 w-8 bg-neutral-100 rounded-full"></div>
              ))}
            </div>
          </div>
          
          <div className="pt-6">
            <div className="h-12 bg-neutral-100 rounded-full w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-6 animate-pulse">
      <div className="h-8 bg-neutral-100 rounded w-1/3"></div>
      <div className="h-4 bg-neutral-100 rounded w-1/4"></div>
      <div className="space-y-3 pt-6">
        <div className="h-3 bg-neutral-100 rounded w-full"></div>
        <div className="h-3 bg-neutral-100 rounded w-full"></div>
        <div className="h-3 bg-neutral-100 rounded w-5/6"></div>
        <div className="h-3 bg-neutral-100 rounded w-4/5"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-neutral-100 rounded-2xl"></div>
        ))}
      </div>
    </div>
  );
}
