'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { UrlPreview } from '@/components/UrlPreview';
import { Copy, ArrowLeft, Edit3, Calendar, Link2, Sparkles, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useSession } from 'next-auth/react';

interface LinkType {
  _id: string;
  urls: string[];
  title?: string; // Optional title field
  slug: string;
  userId: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const LinkPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [link, setLink] = useState<LinkType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const { user } = session || {};
  useEffect(() => {
    const fetchLink = async () => {
      if (!id) return;

      try {
        const response = await fetch(`/api/links?slug=${id}`, {
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

        const data = await response.json();
        setLink(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        console.error('Error fetching link:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLink();
  }, [id]);

  useEffect(() => {
    if (link) {
      document.title = link.title || link.slug;
    }
  }, [link]);

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-3 border-gradient-to-r border-t-transparent animate-spin mx-auto bg-gradient-to-r from-purple-500 to-blue-500 p-0.5">
            <div className="w-full h-full rounded-full bg-white"></div>
          </div>
          <p className="mt-4 text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Loading your collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="max-w-md w-full bg-white/90 backdrop-blur-xl border border-white/20 p-8 text-center shadow-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center mx-auto shadow-lg">
            <Link2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-6 text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">{error}</h1>
          <p className="mt-3 text-sm text-gray-600">
            The link you're looking for might have been moved or doesn't exist.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-8 inline-flex items-center px-6 py-3 text-sm font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  if (!link) {
    return null; // This should not happen but TypeScript requires it
  }

  return (
    <div className="min-h-screen px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-4xl pt-10 mx-auto relative">
        {/* Header */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {status === 'authenticated' && user?.id === link.userId && (
            <>
              <div className="flex items-center justify-between mb-6">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>

                <button
                  onClick={() => router.push(`/link/edit/${link.slug}`)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-800 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Collection
                </button>
              </div>
            </>
          )
          }


          <div className="bg-transparent backdrop-blur-xl relative overflow-hidden">
            {/* Gradient overlay */}
            {/* <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5"></div> */}

            <div className="relative">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold bg-primary bg-clip-text text-transparent">
                          {link.title}
                        </h1>
                        <h2>
                          <span className="text-gray-100 text-sm">Collection</span> - /{link.slug}
                        </h2>
                      </div>
                    </div>

                    <motion.button
                      onClick={() => copyToClipboard(`${window.location.origin}/${link.slug}`)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 bg-primary text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                      title="Copy link to clipboard"
                    >
                      {copiedUrl === `${window.location.origin}/${link.slug}` ? (
                        <motion.div
                          initial={{ scale: 0.8, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0,  }}
                          className="h-4 w-4 relative -top-1"
                        >
                          ✓
                        </motion.div>
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </motion.button>
                  </div>

                  {link.description && (
                    <p className="text-gray-200 mb-4 text-lg leading-relaxed">{link.description}</p>
                  )}

                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-base-300 rounded-full">
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      <span className="text-gray-300 font-medium">Created {new Date(link.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-base-300 rounded-full">
                      <Zap className="h-4 w-4 text-purple-500" />
                      <span className="text-gray-300 font-medium">{link.urls.length} {link.urls.length === 1 ? 'link' : 'links'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        {/* URLs Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6"
        >
          {link.urls.map((url, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: 0.2 + index * 0.1,
                type: "tween",
                stiffness: 100,
                damping: 15
              }}
              className="group relative"
            >
              {/* Glowing border effect */}
              <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>

              <div className="relative">
                <UrlPreview url={url} className="transform transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl" />

                {/* Floating action button */}
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    copyToClipboard(url);
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -bottom-2 -right-8 w-8 h-8 cursor-pointer bg-accent text-white shadow-lg hover:shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center justify-center"
                  title="Copy URL"
                >
                  {copiedUrl === url ? (
                    <motion.div
                      initial={{ scale: 0.5, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="text-sm font-bold"
                    >
                      ✓
                    </motion.div>
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </motion.button>

                {/* Link number badge */}
                <div
                  className={`absolute -top-3 -left-8 w-8 h-8 bg-accent transition-transform duration-200 text-white text-sm font-bold flex items-center justify-center shadow-lg
                    ${index % 2 === 0 ? 'group-hover:rotate-12' : 'group-hover:-rotate-12'}`}
                >
                  {index + 1}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty state */}
        {link.urls.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mx-auto shadow-2xl">
                <Link2 className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg animate-bounce">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">Ready to add some magic?</h3>
            <p className="text-gray-600 mb-8 text-lg">This collection is waiting for your awesome links.</p>
            <motion.button
              onClick={() => router.push(`/link/edit/${link.slug}`)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200 shadow-xl hover:shadow-2xl"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Add Your First Link
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-20 pb-8 px-4 w-full flex flex-col items-center text-center">
        <div className="w-full max-w-md">
          {
            status !== 'authenticated' && (

          <Link
        href="/sign-up"
        className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200 mb-4 text-base sm:text-lg"
          >
        <Sparkles className="h-5 w-5 mr-2" />
        <span>Build your own URL Wrapper</span>
          </Link>
            )
          }
        </div>
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
    </div>
  );
};

export default LinkPage;
