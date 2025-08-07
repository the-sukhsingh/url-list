
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
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`group relative bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:border-gray-200 ${className}`}
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
                        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                    </div>
                    
                    {/* Content skeleton */}
                    <div className="space-y-3">
                        <div className="h-5 w-4/5 rounded-lg bg-gray-200"></div>
                        <div className="h-4 w-full rounded-lg bg-gray-100"></div>
                        <div className="h-4 w-3/4 rounded-lg bg-gray-100"></div>
                    </div>
                    
                    {/* Tags skeleton */}
                    <div className="flex items-center space-x-2 mt-4">
                        <div className="h-6 w-16 rounded-full bg-gray-200"></div>
                        <div className="h-6 w-20 rounded-full bg-gray-100"></div>
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
                className={`group relative bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-100 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${className}`}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className={`group relative block w-full bg-gradient-to-br from-white via-gray-50 to-white border-2 border-gray-100 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-gray-200 hover:shadow-blue-100/50 ${className}`}
        >
            {/* Decorative corner elements */}
            <div className="absolute top-3 left-3 w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
            <div className="absolute top-3 right-3 w-2 h-2 bg-purple-400 rounded-full opacity-60"></div>
            
            {/* Glowing effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

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
                                        alt=""
                                        className="w-full h-full object-cover"
                                        onError={() => {
                                            const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${metadata.domain}&sz=64`;
                                            if (metadata.favicon !== fallbackFavicon) {
                                                setMetadata(prev => prev ? { ...prev, favicon: fallbackFavicon } : null);
                                            } else {
                                                setImageError(true);
                                            }
                                        }}
                                        width={60}
                                        height={60}
                                    />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                                    <Globe className="h-5 w-5 text-white" />
                                </div>
                            )}
                        </motion.div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-700 truncate">
                                {metadata.siteName || metadata.domain}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {metadata.domain}
                            </p>
                        </div>
                    </div>


                </div>

                {/* Content Section */}
                <div className="space-y-3 mb-4">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-700 transition-colors">
                        <span dangerouslySetInnerHTML={{ __html: metadata.title || 'Untitled Link' }} />
                    </h3>

                    {metadata.description && (
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                            <span dangerouslySetInnerHTML={{ __html: metadata.description }} />
                        </p>
                    )}
                </div>

                {/* Tags/Info Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                            <LinkIcon className="w-3 h-3 mr-1" />
                            Link
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                        </span>
                    </div>
                    
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors"
                    >
                        Click to visit →
                    </motion.div>
                </div>

                {/* Preview Image (optional) */}
                {metadata.image && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                        <Image
                            src={metadata.image}
                            alt={metadata.title || 'Preview'}
                            className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                            width={400}
                            height={200}
                        />
                    </div>
                )}
            </div>

            {/* Subtle animation border */}
            {/* <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10 blur-xl"></div> */}
        </motion.a>
    );
};