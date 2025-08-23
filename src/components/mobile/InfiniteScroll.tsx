'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface InfiniteScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  loading: boolean;
  threshold?: number;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  className?: string;
  itemHeight?: number;
  overscan?: number;
}

export function InfiniteScroll<T>({
  items,
  renderItem,
  onLoadMore,
  hasMore,
  loading,
  threshold = 100,
  loadingComponent,
  emptyComponent,
  errorComponent,
  className = '',
  itemHeight,
  overscan = 5,
}: InfiniteScrollProps<T>) {
  const [error, setError] = useState<string | null>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadingRef.current) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        
        if (entry.isIntersecting && hasMore && !loading && !isLoadingRef.current) {
          isLoadingRef.current = true;
          setError(null);
          
          try {
            await onLoadMore();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar mais itens');
          } finally {
            isLoadingRef.current = false;
          }
        }
      },
      { 
        rootMargin: `${threshold}px`,
        threshold: 0.1,
      }
    );

    observer.observe(loadingRef.current);

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore, threshold]);

  // Virtual scrolling for performance
  const [visibleItems, setVisibleItems] = useState<T[]>(items);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    if (!itemHeight || !scrollElementRef.current) {
      setVisibleItems(items);
      return;
    }

    const handleScroll = () => {
      const element = scrollElementRef.current;
      if (!element) return;

      const scrollTop = element.scrollTop;
      const clientHeight = element.clientHeight;
      
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const endIndex = Math.min(
        items.length,
        Math.ceil((scrollTop + clientHeight) / itemHeight) + overscan
      );

      setVisibleItems(items.slice(startIndex, endIndex));
      setContainerHeight(items.length * itemHeight);
    };

    const element = scrollElementRef.current;
    element.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => element.removeEventListener('scroll', handleScroll);
  }, [items, itemHeight, overscan]);

  const defaultLoadingComponent = (
    <div className="flex items-center justify-center py-8 space-x-2">
      <motion.div
        className="w-2 h-2 bg-blue-600 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: 0,
        }}
      />
      <motion.div
        className="w-2 h-2 bg-blue-600 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: 0.2,
        }}
      />
      <motion.div
        className="w-2 h-2 bg-blue-600 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: 0.4,
        }}
      />
      <span className="ml-3 text-sm text-gray-600">Carregando mais...</span>
    </div>
  );

  const defaultEmptyComponent = (
    <motion.div
      className="flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-4.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item encontrado</h3>
      <p className="text-gray-500">Não há itens para exibir no momento.</p>
    </motion.div>
  );

  const defaultErrorComponent = (
    <motion.div
      className="flex flex-col items-center justify-center py-8 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">Erro ao carregar</h3>
      <p className="text-sm text-gray-500 mb-3">{error}</p>
      <button
        onClick={() => {
          setError(null);
          onLoadMore().catch((err) => {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
          });
        }}
        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
      >
        Tentar novamente
      </button>
    </motion.div>
  );

  if (items.length === 0 && !loading) {
    return emptyComponent || defaultEmptyComponent;
  }

  return (
    <div 
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: itemHeight ? containerHeight : 'auto' }}
    >
      {/* Virtual scrolling spacer */}
      {itemHeight && (
        <div style={{ height: containerHeight }} className="relative">
          <div 
            style={{
              transform: `translateY(${Math.floor((items.length - visibleItems.length) / 2) * itemHeight}px)`,
            }}
          >
            {visibleItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                style={{ height: itemHeight }}
              >
                {renderItem(item, index)}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Regular rendering */}
      {!itemHeight && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
            >
              {renderItem(item, index)}
            </motion.div>
          ))}
        </div>
      )}

      {/* Loading/Error states */}
      <div ref={loadingRef} className="h-1">
        {error && (errorComponent || defaultErrorComponent)}
        {loading && !error && (loadingComponent || defaultLoadingComponent)}
        {!hasMore && !loading && !error && items.length > 0 && (
          <motion.div
            className="text-center py-8 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Não há mais itens para carregar.
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Hook for infinite scroll logic
export function useInfiniteScroll<T>(
  fetchMore: (page: number) => Promise<T[]>,
  initialData: T[] = [],
  pageSize = 10
) {
  const [items, setItems] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const newItems = await fetchMore(page);
      
      if (newItems.length < pageSize) {
        setHasMore(false);
      }
      
      setItems(prevItems => [...prevItems, ...newItems]);
      setPage(prevPage => prevPage + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [fetchMore, page, pageSize, loading]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    reset();
    await loadMore();
  }, [reset, loadMore]);

  return {
    items,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
    refresh,
  };
}

export default InfiniteScroll;