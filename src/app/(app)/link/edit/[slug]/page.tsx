'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UrlPreviewEdit } from '@/components/UrlPreviewEdit';
import Container from '@/components/Container';
import { Draggable } from "react-drag-reorder";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
      <div className="min-h-screen  pt-16 px-4 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-purple-200 border-b-purple-500 animate-spin animate-reverse"></div>
        </div>
        <p className="mt-6 text-gray-600 font-medium">Loading your link...</p>
        <div className="mt-2 flex space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    );
  }

  // Debug log for current state

  return (
    <Container className="min-h-screen px-4">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative">



        <div className="bg-transparent backdrop-blur-sm overflow-hidden">
          {/* Header */}
          <div className="p-8">
            {status === 'authenticated' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Link>

                </div>
              </>
            )
            }
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-gray-50 text-xl font-semibold">
                      {formData.title ? formData.title : <span className="text-gray-400 text-lg">Untitled Collection</span>}
                    </div>
                    <div className="text-gray-500 text-sm font-mono bg-gray-100 px-2 py-1 rounded-md inline-block mt-1">
                      {slug ? `/${slug}` : <span className="text-gray-400">No slug</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3 bg-white/70 rounded-full px-4 py-2 border border-gray-200">
                  <span className="text-gray-600 text-sm font-medium">Private</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, viewType: prev.viewType === 'private' ? 'public' : 'private' }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${formData.viewType === 'public'
                      ? 'bg-gradient-to-r from-green-400 to-blue-500 shadow-lg'
                      : 'bg-gray-300'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-md ${formData.viewType === 'public' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                  <span className="text-gray-600 text-sm font-medium">Public</span>
                </div>
              </div>
            </div>

          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent pointer-events-none" />

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Description with creative styling */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-gray-100 font-medium">
                <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-pink-500 rounded-md flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </div>
                <span>Collection Description</span>
              </label>
              <div className="relative">
                <textarea
                  name="description"
                  id="description"
                  rows={2}
                  className="block w-full px-4 py-4 text-gray-50 bg-transparent border border-gray-200 placeholder-gray-500 resize-none transition-all duration-200 backdrop-blur-sm shadow-sm"
                  placeholder="Tell your audience what this collection is about... ✨"
                  value={formData.description}
                  spellCheck="false"
                  maxLength={200}
                  onChange={handleInputChange}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {formData.description.length}/200
                </div>
              </div>
            </div>

            {/* URL Input with enhanced design */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-gray-50 font-medium">
                <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-purple-500 rounded-md flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span>Add New Link</span>
              </label>
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={handleUrlInputKeyDown}
                    placeholder="https://example.com - Paste your link here"
                    className="w-full px-4 py-4 text-gray-50 bg-transparent border border-gray-200 placeholder-gray-400 transition-all duration-200 backdrop-blur-sm shadow-sm pr-12"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addUrl();
                  }}
                  disabled={!urlInput.trim()}
                  className="px-8 py-4 bg-primary text-white font-medium  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer disabled:transform-none"
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add Link</span>
                  </span>
                </button>
              </div>
            </div>

            {/* URL Previews with creative design */}
            <div className="space-y-4">
              {urlData.length > 0 && (
                <div className="flex items-center space-x-2 mb-4 ">
                  <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-white font-medium">Your Links ({urlData.length})</span>
                </div>
              )}
              <Draggable key={`draggable-${renderKey}`} onPosChange={getChangedPos}>
                {urlData.map((data, index) => {
                  return (
                    <div key={`url-${data.url}-${index}-${urlData.length}`} className="group relative bg-transparent mb-4 p-1 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border">
                      <div className="flex items-start justify-between w-full relative">

                        <div className="flex-1 w-full">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1">
                              Link #{index + 1}
                            </div>
                          </div>
                          <UrlPreviewEdit
                            key={`preview-${data.url}-${data.loading}-${data.title || 'no-title'}`}
                            urlData={data}
                            index={index}
                            onMetadataUpdate={handleMetadataUpdate}
                            className='w-full'
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeUrl(data.url)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 absolute top-0 right-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          title="Remove this link"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </Draggable>

              {urlData.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed border-gray-300">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">No links yet</h3>
                  <p className="text-gray-500 mb-4">Start building your collection by adding your first link above</p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                    <span>💡</span>
                    <span>Tip: You can add multiple links to create a curated collection</span>
                  </div>
                </div>
              )}
            </div>

            {/* Creative footer with action buttons */}
            <div className="px-8 py-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {urlData.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{urlData.length} link{urlData.length !== 1 ? 's' : ''} added</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">

                <button
                  type="submit"
                  disabled={isSubmitting || formData.urls.length === 0}
                  className="px-8 py-3 bg-primary text-white font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {isSubmitting ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save & View</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Creative floating help card */}
        {urlData.length === 0 && (
          <div className="mt-8 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Getting Started</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Add links to articles, videos, or any web content</li>
                  <li>• Write a description to give context to your collection</li>
                  <li>• Choose between public or private visibility</li>
                  <li>• Share your custom URL with others</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
      <footer className="py-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-gray-400 text-sm mt-2">
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
    </Container>
    
  );
};

export default EditLinkPage;
