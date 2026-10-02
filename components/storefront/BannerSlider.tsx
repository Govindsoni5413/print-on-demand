'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, MessageCircle } from 'lucide-react';
import { Banner } from '@/types/database';
import { resolveBannerUrl } from '@/lib/banner-utils';

interface BannerSliderProps {
  banners: Banner[];
  autoplayIntervalMs?: number;
  autoplayEnabled?: boolean;
  transition?: 'fade' | 'slide';
  designSlugMap?: Record<string, string>;
  categorySlugMap?: Record<string, string>;
}

export function BannerSlider({
  banners = [],
  autoplayIntervalMs = 5000,
  autoplayEnabled = true,
  transition = 'fade',
  designSlugMap = {},
  categorySlugMap = {},
}: BannerSliderProps) {
  // If zero live banners, render nothing (no gap)
  if (!banners || banners.length === 0) {
    return null;
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const total = banners.length;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay timer
  useEffect(() => {
    if (!autoplayEnabled || prefersReducedMotion || isHovered || isInteracting || total <= 1) {
      return;
    }

    const interval = setInterval(() => {
      goToNext();
    }, autoplayIntervalMs);

    return () => clearInterval(interval);
  }, [autoplayEnabled, prefersReducedMotion, isHovered, isInteracting, total, autoplayIntervalMs, goToNext]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPrev();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsInteracting(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsInteracting(false);
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      goToNext(); // Swiped left -> next
    } else if (diff < -50) {
      goToPrev(); // Swiped right -> prev
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Click tracking
  const trackBannerClick = async (banner: Banner, url: string) => {
    try {
      const sessionId = typeof window !== 'undefined' ? localStorage.getItem('revntrix_session_id') || 'guest' : 'guest';
      fetch('/api/track/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'banner_click',
          bannerId: banner.id,
          sessionId,
          metadata: {
            banner_id: banner.id,
            title: banner.title,
            link_target: banner.link_target,
            resolved_url: url,
          },
        }),
      }).catch(() => {});
    } catch {
      // Ignore client tracking errors
    }
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-black select-none outline-none group focus:ring-2 focus:ring-zinc-800"
      aria-label="Promotional Carousel"
      role="region"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9] min-h-[420px] sm:min-h-[480px] md:min-h-[520px] max-h-[640px]">
        {banners.map((banner, index) => {
          const isActive = index === currentIndex;
          const resolvedUrl = resolveBannerUrl(banner, designSlugMap, categorySlugMap);
          const isWhatsApp = banner.link_type === 'whatsapp';
          const isImageOnly = banner.text_mode === 'image_only';

          // Transition styling
          let transitionClasses = 'transition-opacity duration-700 ease-in-out';
          let positionClasses = isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none';

          if (transition === 'slide' && !prefersReducedMotion) {
            transitionClasses = 'transition-all duration-700 ease-in-out';
            if (isActive) {
              positionClasses = 'translate-x-0 opacity-100 z-10';
            } else if (index < currentIndex) {
              positionClasses = '-translate-x-full opacity-0 z-0 pointer-events-none';
            } else {
              positionClasses = 'translate-x-full opacity-0 z-0 pointer-events-none';
            }
          }

          if (prefersReducedMotion) {
            transitionClasses = 'transition-none';
          }

          // Text alignment
          let alignContainer = 'items-start text-left';
          let alignText = 'text-left';
          if (banner.text_align === 'center') {
            alignContainer = 'items-center text-center mx-auto';
            alignText = 'text-center';
          } else if (banner.text_align === 'right') {
            alignContainer = 'items-end text-right ml-auto';
            alignText = 'text-right';
          }

          // Text color theme
          const isLightText = banner.text_color === 'light';
          const textColorClass = isLightText ? 'text-white' : 'text-zinc-950';
          const subtitleColorClass = isLightText ? 'text-zinc-200' : 'text-zinc-800';

          const overlayBg = isLightText
            ? `rgba(0, 0, 0, ${(banner.overlay_opacity ?? 30) / 100})`
            : `rgba(255, 255, 255, ${(banner.overlay_opacity ?? 30) / 100})`;

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 w-full h-full ${transitionClasses} ${positionClasses}`}
              aria-hidden={!isActive}
            >
              {/* Responsive Picture: Desktop vs Mobile Crop */}
              <picture className="block w-full h-full">
                {banner.mobile_image_url && (
                  <source media="(max-width: 768px)" srcSet={banner.mobile_image_url} />
                )}
                <img
                  src={banner.desktop_image_url}
                  alt={banner.title || 'Banner'}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  className="w-full h-full object-cover object-center"
                />
              </picture>

              {/* Scrim Overlay */}
              <div
                className="absolute inset-0 pointer-events-none transition-colors duration-500"
                style={{ backgroundColor: overlayBg }}
              />

              {/* Banner Content */}
              {isImageOnly ? (
                // Image Only: entire area clickable
                <Link
                  href={resolvedUrl}
                  onClick={() => trackBannerClick(banner, resolvedUrl)}
                  className="absolute inset-0 w-full h-full z-20 focus:outline-none"
                  aria-label={banner.title || 'View drop'}
                />
              ) : (
                // Content Overlay
                <div className="absolute inset-0 z-20 flex flex-col justify-end sm:justify-center p-6 sm:p-12 md:p-16 max-w-7xl mx-auto pointer-events-none">
                  <div className={`max-w-2xl flex flex-col ${alignContainer} space-y-3 sm:space-y-4 pointer-events-auto`}>
                    {banner.title && (
                      <h2
                        className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight uppercase leading-[1.05] drop-shadow-md ${textColorClass} ${alignText}`}
                      >
                        {banner.title}
                      </h2>
                    )}
                    {banner.subtitle && (
                      <p
                        className={`text-xs sm:text-base md:text-lg font-medium max-w-lg leading-relaxed drop-shadow ${subtitleColorClass} ${alignText}`}
                      >
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.cta_text && (
                      <div className="pt-2">
                        {isWhatsApp ? (
                          <a
                            href={resolvedUrl}
                            onClick={() => trackBannerClick(banner, resolvedUrl)}
                            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-white shadow-xl hover:shadow-2xl transition transform hover:-translate-y-0.5 active:translate-y-0"
                          >
                            <MessageCircle className="w-4 h-4 fill-white text-emerald-500" />
                            {banner.cta_text}
                          </a>
                        ) : (
                          <Link
                            href={resolvedUrl}
                            onClick={() => trackBannerClick(banner, resolvedUrl)}
                            className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition transform hover:-translate-y-0.5 active:translate-y-0 shadow-xl ${
                              isLightText
                                ? 'bg-white hover:bg-zinc-100 text-zinc-950'
                                : 'bg-zinc-950 hover:bg-zinc-800 text-white'
                            }`}
                          >
                            <span>{banner.cta_text}</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Controls (Arrows) - Desktop only */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Previous slide"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full items-center justify-center bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next slide"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full items-center justify-center bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Navigation Indicators (Dots) */}
      {total > 1 && (
        <div
          className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10"
          role="tablist"
          aria-label="Carousel pagination"
        >
          {banners.map((_, dotIdx) => {
            const isDotActive = dotIdx === currentIndex;
            return (
              <button
                key={dotIdx}
                type="button"
                role="tab"
                aria-selected={isDotActive}
                aria-label={`Go to slide ${dotIdx + 1}`}
                onClick={() => setCurrentIndex(dotIdx)}
                className={`transition-all duration-300 rounded-full ${
                  isDotActive
                    ? 'w-6 h-2 bg-white'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
