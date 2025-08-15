'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Copy,
  ArrowLeft,
  Link2,
  CheckIcon,
  SettingsIcon,
  CopyIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { Viewer } from '@/components/Viewer';
import Footer from '@/components/Footer';

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
      setTimeout(() => setCopiedUrl(null), 1300);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
              onClick={() => router.push('/build')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Build
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
    <>
      <div className=' min-h-screen w-full font-sans flex flex-col  justify-start items-center pt-3 overflow-hidden'>
        {/* Header */}
        <div className='screen-line-after screen-line-before p-2 w-full text-3xl font-semibold max-w-4xl border-x border-edge'>
          {link.title || link.slug}
          <div className='absolute inset-y-0 right-0 flex items-center'>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => copyToClipboard(
                window.location.origin + "/" + link.slug
              )}
              type='button'
              className='w-12 p-3 h-full border-x border-edge'>
                {
                  copiedUrl === window.location.origin + "/" + link.slug ? (<CheckIcon className="w-full h-full text-neutral-700 dark:text-neutral-200" />) : (<CopyIcon className="w-full h-full text-neutral-700 dark:text-neutral-200" />)
                }
            </motion.button>
            <motion.button type='button' className='w-12 p-3 h-full'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => console.log("Settings clicked")}
            >
              <Link href={window.location.origin + "/" + link.slug + '/edit'}>
                <SettingsIcon className="w-full h-full text-neutral-700 dark:text-neutral-200" />
              </Link>
            </motion.button>
          </div>
        </div>
        <div className='screen-line-after px-3 py-1 w-full font-light max-w-4xl border-x border-edge'>
          {link.description ?? <span className="text-gray-500">No description available</span>}
        </div>
        <div className='screen-line-after bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] [--pattern-foreground:var(--color-edge)]/56 max-w-4xl w-full mx-auto text-center h-10 border-x border-edge'>
        </div>
        {/* Main Content */}
        <main className="mx-auto w-full max-w-4xl">
          {link.urls.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Link2 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No links yet</h3>
              <p className="text-gray-600 mb-6">This collection is waiting for its first link.</p>

            </div>
          ) : (
            <div className="">
              {link.urls.map((url, index) => (
                <motion.div
                  key={`${url}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group screen-line-after"
                >
                  <Viewer url={url} />

                  {/* Copy button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.preventDefault();
                      copyToClipboard(url);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Copy URL"
                  >
                    {copiedUrl === url ? (
                      <CheckIcon className="w-4 h-4 text-neutral-700 dark:text-neutral-200" />
                    ) : (
                      <Copy className="w-4 h-4 text-neutral-700 dark:text-neutral-200" />
                    )}
                  </motion.button>

                  {/* Index badge */}
                  <div className="absolute top-2 -left-8 w-6 h-6 bg-neutral-700 dark:bg-neutral-300 text-white dark:text-black text-sm font-medium flex items-center justify-center rounded-full">
                    {index + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer showBuild={true} />
    </>
  );
};

export default LinkPage;
