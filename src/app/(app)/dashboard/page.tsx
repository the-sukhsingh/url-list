'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDebounceCallback } from "usehooks-ts";
import { AnimatePresence, motion } from 'motion/react';
import { 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Plus, 
  Link as LinkIcon, 
  Edit, 
  Eye, 
  Trash2,
  Calendar,
  Globe,
  Lock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

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
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent mb-4"
            />
            <p className="text-gray-600 font-medium">Loading your dashboard...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-red-200 p-8 max-w-md relative z-10"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => setError(null)}
              className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
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

      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mb-8 relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="absolute top-4 left-12 w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="absolute top-4 left-20 w-3 h-3 bg-green-400 rounded-full"></div>

            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mt-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {userData?.user?.username}! 👋
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage your link collections and share them with the world
                </p>
              </div>
              <motion.button
                onClick={() => setShowCreateModal(true)}
                className="mt-6 lg:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center group"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                Create New Collection
              </motion.button>
            </div>

            {/* Stats */}
            {userData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userData.links.length}</div>
                  <div className="text-sm text-gray-500">Total Collections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userData.links.reduce((total, link) => total + link.urls.length, 0)}
                  </div>
                  <div className="text-sm text-gray-500">Total Links</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Date(userData.user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                  <div className="text-sm text-gray-500">Member Since</div>
                </div>
              </div>
            )}

            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-blue-50 opacity-30 rounded-3xl pointer-events-none"></div>
          </motion.div>

          {/* Collections Grid */}
          {userData && userData.links && userData.links.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            >
              {userData.links.map((link, index) => (
                <motion.div
                  key={link._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 relative"
                  whileHover={{ y: -5 }}
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <LinkIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <Link
                            href={`/${link.slug}`} 
                            className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            /{link.slug}
                          </Link>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Globe className="w-3 h-3 mr-1" />
                              {link.urls.length} URL{link.urls.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteLink(link.slug)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-200 p-2 rounded-lg hover:bg-red-50"
                        title="Delete Collection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {link.description && (
                      <p className="text-gray-600 text-sm leading-relaxed">{link.description}</p>
                    )}
                  </div>

                  {/* URLs Preview */}
                  <div className="p-6">
                    {link.urls.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <LinkIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">No URLs added yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {link.urls.slice(0, 3).map((url, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            <span className="text-gray-700 text-sm truncate flex-1">{url}</span>
                          </div>
                        ))}
                        {link.urls.length > 3 && (
                          <div className="text-center py-2">
                            <span className="text-gray-500 text-sm">+{link.urls.length - 3} more URLs...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 pb-6">
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(link.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/link/edit/${link.slug}`}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Link>
                        <Link
                          href={`/${link.slug}`}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-blue-50 opacity-0 group-hover:opacity-20 rounded-3xl pointer-events-none transition-opacity"></div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-200 relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-4 left-4 w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="absolute top-4 left-12 w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="absolute top-4 left-20 w-3 h-3 bg-green-400 rounded-full"></div>

              <div className="text-center py-16 px-8 mt-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6"
                >
                  <LinkIcon className="w-12 h-12 text-blue-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No collections yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Start building your first link collection to organize and share your favorite URLs with the world.
                </p>
                <motion.button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center group"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Create Your First Collection
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-purple-50 opacity-30 rounded-3xl pointer-events-none"></div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Create Link Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 relative"
            >
              {/* Decorative elements */}
              <div className="absolute top-4 left-4 w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="absolute top-4 left-12 w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="absolute top-4 left-20 w-3 h-3 bg-green-400 rounded-full"></div>

              {/* Header */}
              <div className="p-6 border-b border-gray-200 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Create New Collection</h3>
                      <p className="text-gray-600 text-sm">Start organizing your favorite links</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetCreateForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateLink} className="p-6">
                {createError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {createError}
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="slug" className="block text-sm font-semibold text-gray-700 mb-2">
                      Slug *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">/</span>
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
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="my-awesome-links"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Only letters, numbers, hyphens, and underscores</p>
                    <AnimatePresence>
                      {ischeckingSlug && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center mt-2 text-sm text-blue-600"
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
                          className={`flex items-center mt-2 text-sm ${slugMessage.includes("unique") ? "text-green-600" : "text-red-600"
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
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={createForm.title}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="My Awesome Link Collection"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={createForm.description}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="A brief description of your link collection..."
                    />
                  </div>

                  <div>
                    <label htmlFor="viewType" className="block text-sm font-semibold text-gray-700 mb-2">
                      Visibility
                    </label>
                    <select
                      id="viewType"
                      value={createForm.viewType}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, viewType: e.target.value as 'public' | 'private' }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="public">
                        🌍 Public - Visible to everyone
                      </option>
                      <option value="private">
                        🔒 Private - Only you can see
                      </option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetCreateForm();
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading || ischeckingSlug || !slugMessage.includes("unique")}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
                  >
                    {createLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create & Edit
                      </div>
                    )}
                  </button>
                </div>
              </form>

              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-purple-50 opacity-30 rounded-3xl pointer-events-none"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-gray-600 text-sm">
              <span>
                Made with <span className="text-pink-500">❤️</span> by&nbsp;
                <a
                  href="https://x.com/thesukhjitbajwa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Sukhjit Singh
                </a>
              </span>
            </div>
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-pink-50 opacity-30 rounded-3xl pointer-events-none"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;