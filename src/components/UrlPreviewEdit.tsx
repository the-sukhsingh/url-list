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
      <div className={`relative w-full border border-gray-100 backdrop-blur-sm p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-6 w-6 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 rounded-full bg-gray-200"></div>
              <div className="h-2 w-32 rounded-full bg-gray-100"></div>
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
      <div className={`relative border border-red-100 bg-red-50/50 p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-red-500">
          <Globe className="h-4 w-4" />
          <span className="text-sm">{urlData.error}</span>
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
      className={`group relative block w-full backdrop-blur-sm p-3 transition-all duration-200 hover:shadow-sm ${className}`}
    >
      {/* Subtle gradient background */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div> */}

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2.5">
            {urlData.favicon && !imageError ? (
              <div className="relative">
                <Image
                  src={urlData.favicon}
                  alt=""
                  className="h-5 w-5 rounded-sm"
                  onError={() => {
                    // Try Google's favicon service as fallback
                    const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${urlData.domain}&sz=32`;
                    if (urlData.favicon !== fallbackFavicon) {
                      onMetadataUpdate(index, { favicon: fallbackFavicon });
                    } else {
                      setImageError(true);
                    }
                  }}
                  width={20}
                  height={20}
                />
              </div>
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-gray-100">
                <Globe className="h-3 w-3 text-gray-400" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-50 truncate">
                {urlData.domain}
              </p>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors group-hover:bg-gray-100 group-hover:text-gray-600"
          >
            <ArrowUpRight className="h-3 w-3" />
          </motion.div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-100 line-clamp-2 leading-snug">
            <span dangerouslySetInnerHTML={{ __html: urlData.title || urlData.domain || 'Loading...' }} />
          </h3>

          {urlData.description && (
            <p className="text-xs text-neutral-200 line-clamp-2 leading-relaxed">
              <span dangerouslySetInnerHTML={{ __html: urlData.description }} />
            </p>
          )}
        </div>
      </div>

      {/* Subtle hover indicator */}
      {/* <div className="absolute inset-0  ring-1 ring-gray-200/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div> */}
    </motion.a>
  );
};
