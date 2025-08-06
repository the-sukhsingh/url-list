
'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Globe, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

interface UrlPreviewProps {
    url: string;
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

// Global cache to store metadata across component instances
const metadataCache = new Map<string, URLMetadata>();

export const UrlPreview = ({ url, className = '' }: UrlPreviewProps) => {
    const [metadata, setMetadata] = useState<URLMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);
    const [currentUrl, setCurrentUrl] = useState<string>('');

    useEffect(() => {
        // Reset state when URL changes
        if (currentUrl !== url) {
            setCurrentUrl(url);
            setMetadata(null);
            setLoading(true);
            setError(null);
            setImageError(false);
        }

        const fetchMetadata = async () => {
            if (!url) return;

            // Check cache first
            const cachedMetadata = metadataCache.get(url);
            if (cachedMetadata) {
                setMetadata(cachedMetadata);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            setImageError(false);

            try {
                // Extract domain for fallback
                const urlObj = new URL(url);
                const domain = urlObj.hostname;

                const response = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`, {
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                if (data.error) {
                    throw new Error(data.error);
                }

                // Ensure we have at least basic metadata
                const newMetadata = {
                    title: data.title || domain,
                    description: data.description || `Visit ${domain}`,
                    siteName: data.siteName || domain,
                    favicon: data.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
                    domain: data.domain || domain,
                };
                
                // Cache the metadata
                metadataCache.set(url, newMetadata);
                setMetadata(newMetadata);
            } catch (err) {
                console.warn('Metadata fetch failed, using fallback:', err);

                // Enhanced fallback with better URL parsing
                try {
                    const urlObj = new URL(url);
                    const domain = urlObj.hostname;
                    const path = urlObj.pathname;

                    // Create a more descriptive title from URL
                    let fallbackTitle = domain;
                    if (path && path !== '/') {
                        const pathParts = path.split('/').filter(Boolean);
                        if (pathParts.length > 0) {
                            fallbackTitle = pathParts[pathParts.length - 1]
                                .replace(/[-_]/g, ' ')
                                .replace(/\.[^.]*$/, '') // Remove file extension
                                .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
                        }
                    }

                    const fallbackMetadata = {
                        title: fallbackTitle,
                        description: `Visit ${domain}${path !== '/' ? path : ''}`,
                        domain,
                        siteName: domain,
                        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
                        image: undefined,
                    };
                    
                    // Cache the fallback metadata too
                    metadataCache.set(url, fallbackMetadata);
                    setMetadata(fallbackMetadata);
                } catch (urlError) {
                    setError('Invalid URL format');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMetadata();
    }, [url]);

    if (loading) {
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

    if (error || !metadata) {
        return (
            <div className={`relative border border-red-100 bg-red-50/50 p-4 ${className}`}>
                <div className="flex items-center space-x-2 text-red-500">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">{error || 'Failed to load preview'}</span>
                </div>
            </div>
        );
    }

    return (
        <motion.a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`group relative block w-full backdrop-blur-sm p-4 transition-all duration-200 hover:border-gray-200 hover:shadow-sm ${className}`}
        >
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>

            <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                        {metadata.favicon && !imageError ? (
                            <div className="relative">
                                <Image
                                    src={metadata.favicon}
                                    alt=""
                                    className="h-5 w-5 rounded-sm"
                                    onError={() => {
                                        // Try Google's favicon service as fallback
                                        const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${metadata.domain}&sz=32`;
                                        if (metadata.favicon !== fallbackFavicon) {
                                            setMetadata(prev => prev ? { ...prev, favicon: fallbackFavicon } : null);
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
                                {metadata.domain}
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
                       <span dangerouslySetInnerHTML={{ __html: metadata.title || 'Untitled' }} />
                    </h3>

                    {metadata.description && (
                        <p className="text-xs text-neutral-200 line-clamp-2 leading-relaxed">
                            <span dangerouslySetInnerHTML={{ __html: metadata.description }} />
                        </p>
                    )}
                </div>

                {/* Preview image
                {metadata.image && (
                    <div className="mt-3 overflow-hidden rounded-lg">
                        <Image
                            src={metadata.image}
                            alt={metadata.title || 'Preview'}
                            className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            onError={(e) => {
                                // Hide the image if it fails to load
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                            onLoad={(e) => {
                                // Show the image when it loads successfully
                                (e.target as HTMLImageElement).style.display = 'block';
                            }}
                            width={600}
                            height={400}
                        />
                    </div>
                )} */}
            </div>

            {/* Subtle hover indicator */}
            <div className="absolute inset-0 ring-1 ring-gray-200/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
        </motion.a>
    );
};