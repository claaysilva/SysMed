import React, { useState, useEffect, useRef, useCallback } from "react";

// Hook para lazy loading de conteúdo
export const useLazyLoading = <T>(
    loadFunction: () => Promise<T>,
    dependencies: React.DependencyList = []
) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    const load = useCallback(async () => {
        if (hasLoaded && !dependencies.length) return;

        try {
            setLoading(true);
            setError(null);
            const result = await loadFunction();
            setData(result);
            setHasLoaded(true);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Erro ao carregar dados"
            );
        } finally {
            setLoading(false);
        }
    }, [loadFunction, hasLoaded, dependencies.length]);

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencies, load]);

    const reload = useCallback(() => {
        setHasLoaded(false);
        load();
    }, [load]);

    return { data, loading, error, reload, hasLoaded };
};

// Hook para intersection observer (carregamento quando elemento entra na tela)
export const useIntersectionObserver = (
    options: IntersectionObserverInit = {}
) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasIntersected, setHasIntersected] = useState(false);
    const targetRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const target = targetRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                const isIntersecting = entry.isIntersecting;
                setIsIntersecting(isIntersecting);

                if (isIntersecting && !hasIntersected) {
                    setHasIntersected(true);
                }
            },
            {
                threshold: 0.1,
                rootMargin: "50px",
                ...options,
            }
        );

        observer.observe(target);

        return () => {
            observer.unobserve(target);
        };
    }, [hasIntersected, options]);

    return { targetRef, isIntersecting, hasIntersected };
};

// Hook para debounce (útil para otimizar buscas)
export const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Hook para virtual scrolling (grandes listas)
export const useVirtualScrolling = <T>(
    items: T[],
    itemHeight: number,
    containerHeight: number,
    overscan: number = 5
) => {
    const [scrollTop, setScrollTop] = useState(0);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(0);

    useEffect(() => {
        const visibleItemsCount = Math.ceil(containerHeight / itemHeight);
        const start = Math.max(
            0,
            Math.floor(scrollTop / itemHeight) - overscan
        );
        const end = Math.min(
            items.length - 1,
            start + visibleItemsCount + 2 * overscan
        );

        setStartIndex(start);
        setEndIndex(end);
    }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

    const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
        setScrollTop(event.currentTarget.scrollTop);
    }, []);

    const visibleItems = items.slice(startIndex, endIndex + 1);
    const totalHeight = items.length * itemHeight;
    const offsetY = startIndex * itemHeight;

    return {
        visibleItems,
        totalHeight,
        offsetY,
        handleScroll,
        startIndex,
        endIndex,
    };
};

// Hook para otimização de imagens
export const useOptimizedImage = (src: string, placeholder?: string) => {
    const [imageSrc, setImageSrc] = useState(placeholder || "");
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        const img = new Image();

        img.onload = () => {
            setImageSrc(src);
            setImageLoading(false);
        };

        img.onerror = () => {
            setImageError(true);
            setImageLoading(false);
        };

        img.src = src;

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src]);

    return { imageSrc, imageLoading, imageError };
};

// Hook para cache local
export const useLocalCache = <T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options: {
        ttl?: number; // Time to live in minutes
        dependencies?: React.DependencyList;
    } = {}
) => {
    const { ttl = 60, dependencies = [] } = options;
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getCacheKey = useCallback(() => `cache_${key}`, [key]);
    const getTimestampKey = useCallback(() => `cache_${key}_timestamp`, [key]);

    const isExpired = useCallback(() => {
        const timestamp = localStorage.getItem(getTimestampKey());
        if (!timestamp) return true;

        const now = Date.now();
        const cacheTime = parseInt(timestamp, 10);
        const ttlMs = ttl * 60 * 1000;

        return now - cacheTime > ttlMs;
    }, [getTimestampKey, ttl]);

    const getCachedData = useCallback(() => {
        try {
            const cached = localStorage.getItem(getCacheKey());
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    }, [getCacheKey]);

    const setCachedData = useCallback(
        (data: T) => {
            try {
                localStorage.setItem(getCacheKey(), JSON.stringify(data));
                localStorage.setItem(getTimestampKey(), Date.now().toString());
            } catch (error) {
                console.warn("Failed to cache data:", error);
            }
        },
        [getCacheKey, getTimestampKey]
    );

    const fetchData = useCallback(
        async (forceRefresh = false) => {
            if (!forceRefresh) {
                const cached = getCachedData();
                if (cached && !isExpired()) {
                    setData(cached);
                    return cached;
                }
            }

            try {
                setLoading(true);
                setError(null);
                const result = await fetchFunction();
                setData(result);
                setCachedData(result);
                return result;
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Erro ao carregar dados";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [fetchFunction, getCachedData, isExpired, setCachedData]
    );

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencies, fetchData]);

    const clearCache = useCallback(() => {
        localStorage.removeItem(getCacheKey());
        localStorage.removeItem(getTimestampKey());
    }, [getCacheKey, getTimestampKey]);

    const refresh = useCallback(() => {
        return fetchData(true);
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refresh,
        clearCache,
    };
};

// Componente otimizado para listas grandes
export const VirtualList: React.FC<{
    items: unknown[];
    itemHeight: number;
    height: number;
    renderItem: (item: unknown, index: number) => React.ReactNode;
    className?: string;
}> = ({ items, itemHeight, height, renderItem, className = "" }) => {
    const { visibleItems, totalHeight, offsetY, handleScroll, startIndex } =
        useVirtualScrolling(items, itemHeight, height);

    return React.createElement(
        "div",
        {
            className: `overflow-auto ${className}`,
            style: { height },
            onScroll: handleScroll,
        },
        React.createElement(
            "div",
            { style: { height: totalHeight, position: "relative" } },
            React.createElement(
                "div",
                {
                    style: {
                        transform: `translateY(${offsetY}px)`,
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                    },
                },
                visibleItems.map((item, index) =>
                    renderItem(item, startIndex + index)
                )
            )
        )
    );
};

// Componente de imagem otimizada
export const OptimizedImage: React.FC<{
    src: string;
    alt: string;
    placeholder?: string;
    className?: string;
    width?: number;
    height?: number;
}> = ({ src, alt, placeholder, className = "", width, height }) => {
    const { targetRef, hasIntersected } = useIntersectionObserver();
    const { imageSrc, imageLoading, imageError } = useOptimizedImage(
        hasIntersected ? src : "",
        placeholder
    );

    return React.createElement(
        "div",
        { ref: targetRef, className: `relative ${className}` },
        imageLoading &&
            hasIntersected &&
            React.createElement("div", {
                className: "absolute inset-0 bg-gray-200 animate-pulse",
            }),
        imageError
            ? React.createElement(
                  "div",
                  {
                      className:
                          "bg-gray-300 flex items-center justify-center text-gray-500",
                  },
                  "Erro ao carregar imagem"
              )
            : React.createElement("img", {
                  src: imageSrc,
                  alt: alt,
                  width: width,
                  height: height,
                  className: `${
                      imageLoading ? "opacity-0" : "opacity-100"
                  } transition-opacity duration-300`,
              })
    );
};

export default {
    useLazyLoading,
    useIntersectionObserver,
    useDebounce,
    useVirtualScrolling,
    useOptimizedImage,
    useLocalCache,
    VirtualList,
    OptimizedImage,
};
