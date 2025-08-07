'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UrlPreviewEdit } from '@/components/UrlPreviewEdit';
import { Draggable } from "react-drag-reorder";
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Eye, 
  Trash2, 
  GripVertical, 
  Link2,
  Globe,
  Loader2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Copy,
  FileText,
  CheckCircle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LinkType {
  _id: string;
  urls: string[];
  slug: string;
  userId: string;
  viewType: 'public' | 'private';
  description: string;
  createdAt: string;
  updatedAt: string;
}

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

const EditLinkPage = () => {
  const { slug } = useParams();
  const router = useRouter();
  const { status } = useSession();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    urls: [] as string[],
    viewType: "public"
  });

  const [urlData, setUrlData] = useState<UrlData[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoSaving, setAutoSaving] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  // Force re-render function
  const forceUpdate = () => setRenderKey(prev => prev + 1);

  const fetchMetadata = async (urlDataArray: UrlData[]) => {
    if (!urlDataArray || urlDataArray.length === 0) return;

    // Map each urlData to a fetch promise
    await Promise.all(
      urlDataArray.map(async (urlData) => {
        const url = urlData.url;

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

          setUrlData(prev => {
            const updated = [...prev];
            const index = updated.findIndex(item => item.url === url);
            if (index !== -1) {
              updated[index] = { ...updated[index], ...newMetadata, loading: false, error: undefined };
            }
            return updated;
          });

        } catch (err) {
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
            };
            setUrlData(prev => {
              const updated = [...prev];
              const index = updated.findIndex(item => item.url === url);
              if (index !== -1) {
                updated[index] = { ...updated[index], ...fallbackMetadata, loading: false, error: undefined };
              }
              return updated;
            });
          } catch (fallbackErr) {
            // If even fallback fails, just mark as error
            setUrlData(prev => {
              const updated = [...prev];
              const index = updated.findIndex(item => item.url === url);
              if (index !== -1) {
                updated[index] = { ...updated[index], loading: false, error: 'Failed to fetch metadata' };
              }
              return updated;
            });
          }
        }
      })
    );
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in');
    }

    const fetchLink = async () => {
      if (!slug) return;

      try {
        const response = await fetch(`/api/links?slug=${slug}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Link not found');
          }
          throw new Error('Failed to fetch link');
        }

        const data: LinkType = await response.json();
        setFormData({
          title: data.slug || '',
          description: data.description || '',
          urls: data.urls,
          viewType: data.viewType
        });

        // Initialize urlData with loading state for existing URLs
        const initialUrlData: UrlData[] = data.urls.map(url => ({
          url,
          loading: true,
          error: undefined,
          title: undefined,
          description: undefined,
          siteName: undefined,
          favicon: undefined,
          domain: undefined
        }));
        setUrlData(initialUrlData);

        await fetchMetadata(initialUrlData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        console.error('Error fetching link:', err);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchLink();
    }
  }, [slug, status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    autoSave();
  };

  const autoSave = async () => {
    if (autoSaving) return;

    setAutoSaving(true);
    try {
      const response = await fetch('/api/links', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          urls: formData.urls,
          description: formData.description,
          viewType: formData.viewType
        }),
      });

    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleUrlInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Add url on Enter and CTRL+Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      addUrl();
    }
  };

  const addUrl = async () => {
    let trimmedUrl = urlInput.trim();

    if (trimmedUrl && !(trimmedUrl.startsWith("https://") || trimmedUrl.startsWith("http://"))) {
      trimmedUrl = "https://" + trimmedUrl
    }

    if (trimmedUrl && !formData.urls.includes(trimmedUrl)) {
      const newUrls = [...formData.urls, trimmedUrl];
      
      // Add new URL to urlData with loading state
      const newUrlData: UrlData = {
        url: trimmedUrl,
        loading: true,
        error: undefined,
        title: undefined,
        description: undefined,
        image: undefined,
        siteName: undefined,
        favicon: undefined,
        domain: undefined
      };

      // Update both states immediately
      setFormData(prev => ({ ...prev, urls: newUrls }));
      setUrlData(prev => {
        const updated = [...prev, newUrlData];
        return updated;
      });
      setUrlInput('');
      forceUpdate(); // Force re-render
      
      // Wait a bit for state to settle, then fetch metadata
      setTimeout(async () => {
        // Fetch metadata for the new URL with better error handling
        try {
          const urlObj = new URL(trimmedUrl);
          const domain = urlObj.hostname;

          const response = await fetch(`/api/metadata?url=${encodeURIComponent(trimmedUrl)}`, {
            headers: {
              'Accept': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (!data.error) {
              // Ensure we have at least basic metadata
              const newMetadata = {
                title: data.title || domain,
                description: data.description || `Visit ${domain}`,
                siteName: data.siteName || domain,
                favicon: data.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
                domain: data.domain || domain,
              };

              setUrlData(prev => {
                const updated = [...prev];
                const index = updated.findIndex(item => item.url === trimmedUrl);
                if (index !== -1) {
                  updated[index] = { ...updated[index], ...newMetadata, loading: false, error: undefined };
                } else {
                  console.error('URL not found in array for metadata update:', trimmedUrl);
                }
                return updated;
              });
              forceUpdate(); // Force parent re-render
            } else {
              throw new Error(data.error);
            }
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (err) {
          // Enhanced fallback with better URL parsing
          try {
            const urlObj = new URL(trimmedUrl);
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
            };
            
            setUrlData(prev => {
              const updated = [...prev];
              const index = updated.findIndex(item => item.url === trimmedUrl);
              if (index !== -1) {
                updated[index] = { ...updated[index], ...fallbackMetadata, loading: false, error: undefined };
              } else {
                console.error('URL not found for fallback metadata:', trimmedUrl);
              }
              return updated;
            });
            forceUpdate(); // Force parent re-render
          } catch (fallbackErr) {
            // If even fallback fails, just mark as error
            setUrlData(prev => {
              const updated = [...prev];
              const index = updated.findIndex(item => item.url === trimmedUrl);
              if (index !== -1) {
                updated[index] = { ...updated[index], loading: false, error: 'Failed to fetch metadata' };
              } else {
                console.error('URL not found for error update:', trimmedUrl);
              }
              return updated;
            });
            forceUpdate(); // Force parent re-render
          }
        }
      }, 100); // Small delay to ensure state has updated
      
      // Auto-save with the new URLs
      try {
        const response = await fetch('/api/links', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug,
            urls: newUrls,
            description: formData.description,
            viewType: formData.viewType
          }),
        });
        if (!response.ok) {
          console.error('Auto-save failed:', await response.text());
        }
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    } else {
      console.log('URL not added - either empty or already exists:', trimmedUrl);
    }
  };

  const removeUrl = async (url: string) => {
    // Store the current state for potential revert
    const originalUrls = formData.urls;
    const originalUrlData = urlData;
    
    const updatedUrls = formData.urls.filter(u => u !== url);
    const updatedUrlData = urlData.filter(data => data.url !== url);
    
    // Update both states immediately
    setFormData(prev => ({ ...prev, urls: updatedUrls }));
    setUrlData(updatedUrlData);
    forceUpdate(); // Force re-render

    // Auto-save after removing URL
    try {
      const response = await fetch('/api/links', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          urls: updatedUrls,
          description: formData.description,
          viewType: formData.viewType
        }),
      });
      if (!response.ok) {
        console.error('Auto-save failed:', await response.text());
        // Revert the UI changes if save failed
        setFormData(prev => ({ ...prev, urls: originalUrls }));
        setUrlData(originalUrlData);
      }
    } catch (err) {
      console.error('Auto-save failed:', err);
      // Revert the UI changes if save failed
      setFormData(prev => ({ ...prev, urls: originalUrls }));
      setUrlData(originalUrlData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validation
    if (formData.urls.length === 0) {
      setError('At least one URL is required');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/links', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          urls: formData.urls,
          viewType: formData.viewType,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update link');
      }

      // Redirect to link detail page on success
      router.push(`/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getChangedPos = async (currentPos: number, newPos: number) => {
    // Create a new array with reordered URLs
    const newUrls = [...formData.urls];
    const [movedUrl] = newUrls.splice(currentPos, 1);
    newUrls.splice(newPos, 0, movedUrl);

    // Also reorder the urlData array
    const newUrlData = [...urlData];
    const [movedUrlData] = newUrlData.splice(currentPos, 1);
    newUrlData.splice(newPos, 0, movedUrlData);

    // Update the form data with reordered URLs immediately
    setFormData(prev => ({ ...prev, urls: newUrls }));
    setUrlData(newUrlData);

    // Auto-save the new order
    try {
      const response = await fetch('/api/links', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          urls: newUrls,
          description: formData.description,
          viewType: formData.viewType
        }),
      });
      if (!response.ok) {
        console.error('Auto-save failed:', await response.text());
      }
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  };

  // Function to update URL metadata
  const handleMetadataUpdate = (index: number, metadata: Partial<UrlData>) => {
    setUrlData(prev => {
      const updated = prev.map((item, i) => {
        if (i === index) {
          const newItem = { ...item, ...metadata };
          return newItem;
        }
        return item;
      });
      return updated;
    });
    forceUpdate(); // Force re-render after metadata update
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 relative z-10"
        >
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-red-400 rounded-full"></div>
          <div className="absolute top-4 left-12 w-3 h-3 bg-yellow-400 rounded-full"></div>
          <div className="absolute top-4 left-20 w-3 h-3 bg-green-400 rounded-full"></div>
          
          <div className="flex flex-col items-center mt-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent mb-4"
            />
            <p className="text-gray-600 font-medium">Loading your collection...</p>
            <div className="mt-2 flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/5 to-blue-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Back to Dashboard */}
      <div className="relative z-10 p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl hover:bg-white/80 transition-all duration-300 shadow-sm hover:shadow-md group mb-6"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-8 mb-8 relative overflow-hidden"
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="absolute top-4 left-12 w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-300"></div>
            <div className="absolute top-4 left-20 w-3 h-3 bg-pink-500 rounded-full animate-pulse delay-600"></div>

            <div className="relative flex flex-col lg:flex-row lg:justify-between lg:items-center mt-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Edit Collection
                </h1>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl font-semibold text-gray-700">/{slug}</span>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
                  >
                    <Sparkles className="w-3 h-3 text-white" />
                  </motion.div>
                </div>
                <p className="text-gray-600">
                  Create and manage your curated link collection
                </p>
              </div>

              <div className="flex items-center space-x-4 mt-6 lg:mt-0">
                <Link
                  href={`/${slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-6 py-3 text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="font-medium">Preview</span>
                </Link>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Copy className="w-4 h-4" />
                  <span className="font-medium">Copy Link</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-6 sticky top-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  Add & Manage
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </motion.div>
                  )}

                  {/* Description */}
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 text-gray-700 font-semibold">
                      <FileText className="w-5 h-5 text-purple-500" />
                      <span>Collection Description</span>
                    </label>
                    <div className="relative">
                      <textarea
                        name="description"
                        rows={3}
                        className="block w-full px-4 py-4 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl placeholder-gray-500 resize-none transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white"
                        placeholder="Describe what this collection is about... ✨"
                        value={formData.description}
                        maxLength={200}
                        onChange={handleInputChange}
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded-lg">
                        {formData.description.length}/200
                      </div>
                    </div>
                  </div>

                  {/* URL Input */}
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 text-gray-700 font-semibold">
                      <Link2 className="w-5 h-5 text-blue-500" />
                      <span>Add New Link</span>
                    </label>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="url"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          onKeyDown={handleUrlInputKeyDown}
                          placeholder="https://example.com"
                          className="w-full px-4 py-4 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl placeholder-gray-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white pr-12"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Link2 className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          addUrl();
                        }}
                        disabled={!urlInput.trim()}
                        className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                      >
                        <span className="flex items-center justify-center space-x-2">
                          <Plus className="w-5 h-5" />
                          <span>Add to Collection</span>
                        </span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          {urlData.length} link{urlData.length !== 1 ? 's' : ''} added
                        </span>
                      </div>
                      {urlData.length > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center space-x-1">
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Saving...</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1">
                              <Save className="w-3 h-3" />
                              <span>Save</span>
                            </span>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>

            {/* Right Column - URL Previews */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mr-3">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    Your Collection ({urlData.length})
                  </h2>
                  {urlData.length > 1 && (
                    <div className="text-sm text-gray-500 bg-white/60 px-3 py-1 rounded-lg">
                      Drag to reorder
                    </div>
                  )}
                </div>

                {urlData.length > 0 ? (
                  <Draggable key={`draggable-${renderKey}`} onPosChange={getChangedPos}>
                    {urlData.map((data, index) => (
                      <motion.div
                        key={`url-${data.url}-${index}-${urlData.length}`}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative"
                      >
                        {/* Position indicator */}
                        <div className="absolute -left-4 top-6 z-10">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold flex items-center justify-center rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                            {index + 1}
                          </div>
                        </div>

                        {/* Delete button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => removeUrl(data.url)}
                          className="absolute -right-4 top-6 z-10 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center"
                          title="Remove this link"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>

                        {/* URL Preview */}
                        <div className="pl-8 pr-8">
                          <UrlPreviewEdit
                            key={`preview-${data.url}-${data.loading}-${data.title || 'no-title'}`}
                            urlData={data}
                            index={index}
                            onMetadataUpdate={handleMetadataUpdate}
                            className="w-full transform group-hover:scale-[1.02] transition-transform duration-300"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </Draggable>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 bg-white/60 backdrop-blur-sm border-2 border-dashed border-gray-200 rounded-3xl"
                  >
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <Link2 className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Building Your Collection</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">Add your first link to begin creating an amazing curated collection that you can share with others.</p>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Tip: You can drag and drop to reorder links</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Help Section */}
          {urlData.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-3xl p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Add Links</h3>
                  <p className="text-sm text-gray-600">Paste any URL to add articles, videos, or resources to your collection.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <GripVertical className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Organize</h3>
                  <p className="text-sm text-gray-600">Drag and drop to reorder your links in the perfect sequence.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Share</h3>
                  <p className="text-sm text-gray-600">Copy your custom URL and share your curated collection with anyone.</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <footer className="py-8 mt-16">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-gray-400 text-sm">
            <span>
              Made with <span className="text-pink-500">❤️</span> by&nbsp;
              <a
                href="https://x.com/thesukhjitbajwa"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-indigo-500 transition"
              >
                Sukhjit Singh
              </a>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default EditLinkPage;
