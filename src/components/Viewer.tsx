
'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Globe, ArrowUpRight, Clock, Eye, Link as LinkIcon } from 'lucide-react';
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

export const Viewer = ({ url, className = '' }: UrlPreviewProps) => {
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
                    favicon: data.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
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
                        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
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
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`group relative p-6 transition-all duration-300 hover:shadow-lg ${className}`}
            >
                <div className="animate-pulse">
                    {/* Header skeleton */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-xl bg-gray-200"></div>
                            <div className="space-y-2">
                                <div className="h-3 w-24 rounded-full bg-gray-200"></div>
                                <div className="h-2 w-16 rounded-full bg-gray-100"></div>
                            </div>
                        </div>
                        {/* <div className="h-8 w-8 rounded-full bg-gray-200"></div> */}
                    </div>

                    {/* Content skeleton */}
                    <div className="space-y-3">
                        <div className="h-5 w-4/5 rounded-lg bg-gray-200"></div>
                    </div>
                </div>

                {/* Loading indicator */}
                <div className="absolute top-4 right-4">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                </div>
            </motion.div>
        );
    }

    if (error || !metadata) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`group relative border-2 border-red-100 p-6 transition-all duration-300 hover:shadow-lg ${className}`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                            <Globe className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-red-700">Unable to load preview</h3>
                            <p className="text-sm text-red-600">{error || 'Failed to fetch link data'}</p>
                        </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-red-400" />
                </div>
            </motion.div>
        );
    }

    return (
        <motion.a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative block w-full border-x border-edge p-3 transition-all duration-300 ${className}`}
        >
            {/* Decorative corner elements */}
            {/* <div className="absolute top-3 left-3 w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
            <div className="absolute top-3 right-3 w-2 h-2 bg-purple-400 rounded-full opacity-60"></div> */}

            {/* Glowing effect on hover */}
            {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div> */}

            <div className="relative">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="relative"
                        >
                            {metadata.favicon && !imageError ? (
                                <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                    <Image
                                        src={metadata.favicon}
                                        alt={metadata.title || 'Link Preview'}
                                        className="w-full h-full object-cover rounded-lg"
                                        onError={() => {
                                            const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${metadata.domain}&sz=64`;
                                            if (metadata.favicon !== fallbackFavicon) {
                                                setMetadata(prev => prev ? { ...prev, favicon: fallbackFavicon } : null);
                                            } else {
                                                setImageError(true);
                                            }
                                        }}
                                        width={128}
                                        height={128}
                                    />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                                    <Globe className="h-5 w-5 text-white" />
                                </div>
                            )}
                        </motion.div>

                        <div className="min-w-0 flex-1">
                            <div className="relative">
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 overflow-visible leading-tight line-clamp-2 transition-colors" dangerouslySetInnerHTML={{ __html: metadata.title || 'Untitled Link' }}>
                                </h3>
                                <div className="h-px bg-neutral-800 dark:bg-neutral-300 mt-1 w-0 group-hover:w-full transition-all duration-300 ease-out"></div>
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-200 truncate">
                                {metadata.domain}
                            </p>
                        </div>
                    </div>


                </div>

                {/* Content Section */}

                <div className="">
                    {metadata.description && (
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed line-clamp-3">
                            <span dangerouslySetInnerHTML={{ __html: metadata.description }} />
                        </p>
                    )}
                </div>

                {/* Tags/Info Section */}
                <div className="flex absolute bottom-0 right-0">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-neutral-500 dark:text-neutral-200 group-hover:text-neutral-600 group-hover:dark:text-neutral-400 transition-colors"
                    >
                        Click to visit →
                    </motion.div>
                </div>

            </div>

            {/* Subtle animation border */}
            {/* <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10 blur-xl"></div> */}
        </motion.a>
    );
};