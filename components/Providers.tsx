'use client';

import { ThemeWrapper } from '@/components/ThemeWrapper';
import { FavoritesProvider } from '@/hooks/useFavorites';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeWrapper>
      <FavoritesProvider>
        {children}
      </FavoritesProvider>
    </ThemeWrapper>
  );
} 