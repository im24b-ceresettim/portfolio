'use client';

import { useEffect, useState } from 'react';

const MOBILE_ITEMS_PER_PAGE_QUERY = '(max-width: 720px)';

export function useResponsiveItemsPerPage(desktopItemsPerPage = 2) {
  const [itemsPerPage, setItemsPerPage] = useState(desktopItemsPerPage);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_ITEMS_PER_PAGE_QUERY);

    const updateItemsPerPage = () => {
      setItemsPerPage(mediaQuery.matches ? 1 : desktopItemsPerPage);
    };

    updateItemsPerPage();
    mediaQuery.addEventListener('change', updateItemsPerPage);
    return () => mediaQuery.removeEventListener('change', updateItemsPerPage);
  }, [desktopItemsPerPage]);

  return itemsPerPage;
}
