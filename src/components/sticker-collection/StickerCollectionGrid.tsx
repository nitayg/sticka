
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StickerCollectionGridProps {
  viewMode: 'grid' | 'list' | 'compact';
  activeFilter?: string | null;
  children: ReactNode;
}

const StickerCollectionGrid = ({
  viewMode,
  activeFilter,
  children
}: StickerCollectionGridProps) => {
  return (
    <div className={cn(
      "transition-all duration-200 ease-in-out",
      viewMode === 'list' && "divide-y divide-border",
      viewMode === 'compact' && "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2",
      viewMode === 'grid' && "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 pb-4",
      activeFilter && "pt-2"
    )}>
      {children}
    </div>
  );
};

export default StickerCollectionGrid;
