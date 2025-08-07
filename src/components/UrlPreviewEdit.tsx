'use client';

import { useState, useEffect } from 'react';
import { Globe, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

interface UrlData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
  domain?: string;
  loading: boolean;
  error?: string;
}

interface UrlPreviewEditProps {
  urlData: UrlData;
  index: number;
  onMetadataUpdate: (index: number, metadata: Partial<UrlData>) => void;
  className?: string;
}

interface URLMetadata {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
  domain?: string;
}


export const UrlPreviewEdit = ({ urlData, index, onMetadataUpdate, className = '' }: UrlPreviewEditProps) => {
  const [imageError, setImageError] = useState(false);
  const [renderCount, setRenderCount] = useState(0);

  // Force re-render when urlData changes
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  }, [urlData.loading, urlData.title, urlData.domain, urlData.description, urlData.favicon, urlData.error]);


  if (urlData.loading) {
    return (
      <div className={`relative w-full bg-white rounded-2xl border border-gray-200 p-4 shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-8 w-8 rounded-xl bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 rounded-full bg-gray-200"></div>
              <div className="h-3 w-32 rounded-full bg-gray-100"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-4/5 rounded-full bg-gray-200"></div>
            <div className="h-3 w-full rounded-full bg-gray-100"></div>
            <div className="h-3 w-3/4 rounded-full bg-gray-100"></div>
          </div>
        </div>
      </div>
    );
  }

  if (urlData.error) {
    return (
      <div className={`relative bg-red-50 rounded-2xl border border-red-200 p-4 shadow-sm ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
            <Globe className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-red-700">Failed to load preview</p>
            <p className="text-xs text-red-600">{urlData.error}</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <motion.a
      href={urlData.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`group relative block w-full bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-200 ${className}`}
    >
      {/* Subtle gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 rounded-2xl"></div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {urlData.favicon && !imageError ? (
              <div className="relative">
                <Image
                  src={urlData.favicon}
                  alt=""
                  className="h-8 w-8 rounded-xl shadow-sm"
                  onError={() => {
                    // Try Google's favicon service as fallback
                    const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${urlData.domain}&sz=32`;
                    if (urlData.favicon !== fallbackFavicon) {
                      onMetadataUpdate(index, { favicon: fallbackFavicon });
                    } else {
                      setImageError(true);
                    }
                  }}
                  width={32}
                  height={32}
                />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-purple-100">
                <Globe className="h-4 w-4 text-blue-600" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-700 truncate">
                {urlData.domain}
              </p>
              <p className="text-xs text-gray-500">
                {urlData.siteName || 'Website'}
              </p>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600"
          >
            <ArrowUpRight className="h-4 w-4" />
          </motion.div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-snug">
            <span dangerouslySetInnerHTML={{ __html: urlData.title || urlData.domain || 'Loading...' }} />
          </h3>

          {urlData.description && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              <span dangerouslySetInnerHTML={{ __html: urlData.description }} />
            </p>
          )}

          {/* URL display */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 truncate font-mono">
              {urlData.url}
            </p>
          </div>
        </div>
      </div>

      {/* Subtle hover indicator border */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-blue-200/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
    </motion.a>
  );
};
