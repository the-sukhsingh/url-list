'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { UrlPreview } from '@/components/UrlPreview';
import { 
  Copy, 
  ArrowLeft, 
  Edit3, 
  Calendar, 
  Link2, 
  Sparkles, 
  Zap, 
  Share,
  Eye,
  Heart,
  Star,
  Globe,
  Clock,
  Users,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Loading collection...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <Link2 className="h-8 w-8 text-red-600" />
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 mb-4">
              {error}
            </h1>
            
            <p className="text-gray-600 mb-8">
              The link you're looking for might have been moved or doesn't exist.
            </p>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!link) {
    return null; // This should not happen but TypeScript requires it
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{link.title || link.slug}</h1>
              {link.description && (
                <p className="text-gray-600 mt-1">{link.description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                {link.urls.length} {link.urls.length === 1 ? 'link' : 'links'}
              </span>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => copyToClipboard(`${window.location.origin}/${link.slug}`)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copiedUrl === `${window.location.origin}/${link.slug}` ? (
                  <>
                    <span className="text-green-300 mr-2">✓</span>
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </motion.button>
              
              {status === 'authenticated' && user?.id === link.userId && (
                <>
                  <button
                    onClick={() => router.push(`/link/edit/${link.slug}`)}
                    className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <Link href="/dashboard" className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        {link.urls.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Link2 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No links yet</h3>
            <p className="text-gray-600 mb-6">This collection is waiting for its first link.</p>
            {status === 'authenticated' && user?.id === link.userId && (
              <button
                onClick={() => router.push(`/link/edit/${link.slug}`)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Add First Link
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {link.urls.map((url, index) => (
              <motion.div
                key={`${url}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <UrlPreview url={url} />
                
                {/* Copy button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.preventDefault();
                    copyToClipboard(url);
                  }}
                  className="absolute top-4 right-4 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
                  title="Copy URL"
                >
                  {copiedUrl === url ? (
                    <span className="text-green-600 text-sm font-medium">✓</span>
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </motion.button>

                {/* Index badge */}
                <div className="absolute top-4 left-4 w-6 h-6 bg-blue-600 text-white text-sm font-medium flex items-center justify-center rounded-full">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      {status !== 'authenticated' && (
        <footer className="mt-16 pb-8 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Your Own Collection</h3>
              <p className="text-gray-600 text-sm mb-4">Start curating and sharing your favorite links</p>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default LinkPage;
