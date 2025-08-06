'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDebounceCallback } from "usehooks-ts";
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import Container from '@/components/Container';

interface LinkType {
  _id: string;
  urls: string[];
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  user: {
    _id: string;
    username: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
  links: LinkType[];
}

interface CreateLinkForm {
  slug: string;
  title: string;
  description: string;
  viewType: 'public' | 'private';
}

const Dashboard = () => {
  const { status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [slug, setSlug] = useState<string>('');
  const [slugMessage, setSlugMessage] = useState<string>('');
  const [ischeckingSlug, setIscheckingslug] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateLinkForm>({
    slug: '',
    title: '',
    description: '',
    viewType: 'public'
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const debounced = useDebounceCallback(setSlug, 500);

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (slug.length >= 3) {
        setIscheckingslug(true);
        setSlugMessage("");
        try {
          const response = await fetch(`/api/check-slug-unique?slug=${slug}`);
          const data = await response.json();
          setSlugMessage(data.message);
        } catch (error) {
          setSlugMessage("Error checking username availability");
        } finally {
          setIscheckingslug(false);
        }
      } else {
        setSlug("");
      }
    };
    checkUsernameUnique();
  }, [slug]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in');
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError('Failed to load user data. Please try again later.');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status, router]);

  const handleDeleteLink = async (slug: string) => {


    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/links', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete link');
      }

      // Update user data by removing the deleted link
      setUserData(prev => prev ? {
        ...prev,
        links: prev.links.filter(link => link.slug !== slug)
      } : null);
    } catch (err) {
      setError('Failed to delete link. Please try again.');
      console.error('Error deleting link:', err);
    }
  };


  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);

    // Validate form
    if (!createForm.slug.trim()) {
      setCreateError('Slug is required');
      setCreateLoading(false);
      return;
    }

    if (!createForm.title.trim()) {
      setCreateError('Title is required');
      setCreateLoading(false);
      return;
    }

    // Validate slug format (alphanumeric, hyphens, underscores)
    const slugRegex = /^[a-zA-Z0-9-_]+$/;
    if (!slugRegex.test(createForm.slug)) {
      setCreateError('Slug can only contain letters, numbers, hyphens, and underscores');
      setCreateLoading(false);
      return;
    }

    try {
      // Check if slug already exists
      const checkResponse = await fetch(`/api/links/${createForm.slug}`);
      if (checkResponse.ok) {
        setCreateError('This slug is already taken. Please choose a different one.');
        setCreateLoading(false);
        return;
      }

      // Create the link with basic info
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: createForm.slug,
          title: createForm.title,
          description: createForm.description,
          urls: [] // Start with empty URLs, will be added in edit page
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create link');
      }

      // Close modal and redirect to edit page
      setShowCreateModal(false);
      setCreateForm({ slug: '', title: '', description: '', viewType: "public" });
      router.push(`/link/edit/${createForm.slug}`);
    } catch (err) {
      setCreateError('Failed to create link. Please try again.');
      console.error('Error creating link:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({ slug: '', title: '', description: '', viewType: 'public' });
    setCreateError(null);
    setCreateLoading(false);
    setSlug("")
    setSlugMessage("")
    setIscheckingslug(false)

  };

  const borderVariant = {
    initial: {
      opacity: 0,
      height: '0px',
    },
    animate: {
      opacity: 1,
      height: '100%',
      transition: {
        duration: 1,
        ease: "easeOut" as const,

      },
    },
  }

  if (status === 'loading' || loading) {
    return (
      <Container className="min-h-screen bg-transparent pt-16 px-4 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="min-h-screen pt-16 px-4 flex flex-col items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-600 mt-2">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-4 bg-red-100 text-red-800 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container className="min-h-screen relative">
        <motion.div variants={borderVariant} initial="initial" animate="animate" className='h-full w-px bg-gradient-to-b from-transparent via-primary to-transparent absolute -left-4'>
        </motion.div>
        <motion.div variants={borderVariant} initial="initial" animate="animate" className='h-full w-px bg-gradient-to-b from-transparent via-primary to-transparent absolute -right-4'>
        </motion.div>


        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 ">
          <div className="backdrop-blur-sm overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
                <div>
                  <h2 className="text-2xl font-bold text-primary">Your Link Collections</h2>
                  <p className="text-neutral-400">
                    Organize and manage your curated link collections
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-6 lg:mt-0 inline-flex items-center bg-primary text-white px-6 py-3 hover:-skew-3 transition-all duration-200 shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create New Link
                </button>
              </div>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent pointer-events-none" />

            <div className="p-8">
              {userData && userData.links && userData.links.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  {userData.links.map((link) => (
                    <div key={link._id} className="group bg-transparent hover:bg-base-200 bg-clip-padding backdrop-filter backdrop-blur-sm border border-gray-200/50 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-base-300 rounded-lg flex items-center justify-center group-hover:bg-blue-950 transition-colors duration-200">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            </div>
                            <Link
                              href={`/${link.slug}`} 
                              className="text-lg font-semibold text-white hover:text-blue-600 transition-colors break-all"
                            >
                              /{link.slug}
                            </Link>
                          </div>
                          <button
                            onClick={() => handleDeleteLink(link.slug)}
                            className="opacity-0 group-hover:opacity-100 text-white hover:text-red-500 transition-all duration-200 p-1 rounded-lg hover:bg-red-50"
                            title="Delete Link"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>

                        {link.description && (
                          <p className="text-neutral-300 text-sm mb-4 line-clamp-2 leading-relaxed">{link.description}</p>
                        )}

                        <div className="mb-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {link.urls.length} URL{link.urls.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="space-y-2 ">
                            {
                              link.urls.length === 0 && (
                                <div className="text-neutral-300 text-sm my-7">No URLs added yet</div>
                              )
                            }
                            {link.urls.slice(0, 2).map((url, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm">
                                <div className="w-2 h-2 bg-gray-300 rounded-full flex-shrink-0"></div>
                                <span className="text-gray-50 truncate">{url}</span>
                              </div>
                            ))}
                            {link.urls.length > 2 && (
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <div className="w-2 h-2 bg-gray-200 rounded-full flex-shrink-0"></div>
                                <span className='text-neutral-200'>+{link.urls.length - 2} more URLs...</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className='w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent px-4'></div>


                        <div className="flex justify-between items-center pt-4">
                          <div className="text-xs text-gray-100">
                            {new Date(link.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className='flex justify-center items-center gap-2'>

                            <Link
                              href={`/link/edit/${link.slug}`}
                              className="inline-flex items-center text-white hover:text-neutral-400 text-sm font-medium transition-colors"
                            >
                              Edit

                            </Link>
                            <Link
                              href={`/${link.slug}`}
                              className="inline-flex items-center text-white hover:text-neutral-400 text-sm font-medium transition-colors"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No link collections yet</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Start building your first link collection to organize and share your favorite URLs with the world.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center bg-primary text-white px-6 py-3  transition-all duration-200 hover:-skew-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create Your First Link
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </Container>

      {/* Create Link Modal */}
      {showCreateModal && (
        <Container className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-base-100 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Create New Link Collection</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-white/50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateLink} className="p-6">
              {createError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{createError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-50 mb-2">
                    Slug *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-sm">/</span>
                    <input
                      type="text"
                      id="slug"
                      minLength={3}
                      maxLength={50}
                      value={createForm.slug}
                      onChange={(e) => {
                        setCreateForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') }))
                        debounced(e.target.value)
                      }}
                      className="w-full text-white pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="my-awesome-links"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-50 mt-1">Only letters, numbers, hyphens, and underscores allowed</p>
                  <AnimatePresence>
                    {ischeckingSlug && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center mt-3 text-sm text-indigo-600"
                      >
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking availability...
                      </motion.div>
                    )}
                    {slugMessage && !ischeckingSlug && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className={`flex items-center mt-3 text-shadow-xs  text-sm ${slugMessage.includes("unique") ? "text-green-400 text-shadow-green-400" : "text-red-600 text-shadow-red-600"
                          }`}
                      >
                        {slugMessage.includes("unique") ? (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        ) : (
                          <AlertCircle className="w-4 h-4 mr-2" />
                        )}
                        {slugMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>


                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-50 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-white px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="My Awesome Link Collection"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-50 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full text-white px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="A brief description of your link collection..."
                  />
                </div>

                <div>
                  <label htmlFor="viewType" className="block text-sm font-medium text-gray-50 mb-2">
                    Visibility
                  </label>
                  <select
                    id="viewType"
                    value={createForm.viewType}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, viewType: e.target.value as 'public' | 'private' }))}
                    className="w-full text-white px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="public" className="text-gray-900 bg-white">
                      Public - Visible to everyone
                    </option>
                    <option value="private" className="text-gray-900 bg-white">
                      Private - Only you can see
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-100 rounded-lg hover:bg-gray-50 hover:text-black transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || ischeckingSlug || !slugMessage.includes("unique")}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                >
                  {createLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create & Edit'
                  )}
                </button>
              </div>
            </form>
          </div>

        </Container>
      )}
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
    </>
  );
};

export default Dashboard;