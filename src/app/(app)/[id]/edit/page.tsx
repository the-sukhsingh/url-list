"use client"
import React, { useEffect, useState } from 'react'
import { motion } from "framer-motion"
import { useParams, useRouter } from 'next/navigation'
import { FiTag } from 'react-icons/fi'
import { Viewer } from '@/components/Viewer'
import { CircleCheckIcon, CircleXIcon, LoaderPinwheelIcon, X } from 'lucide-react'

import Authorization from '@/components/Authorization'
import { useDebounceCallback } from 'usehooks-ts'
import Footer from '@/components/Footer'

// The main data structure for the link collection form
export interface CreateLinkForm {
    slug: string,
    title: string,
    description: string,
    keyWord: string,
    urls: string[],
}


const EditPage = () => {

    const { id } = useParams();
    const router = useRouter();

    // --- STATE MANAGEMENT ---

    // Authorization state
    const [slug, setSlug] = useState<string>('');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [authKey, setAuthKey] = useState<string>('');
    const [authError, setAuthError] = useState<string | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(false);

    // Single state object for all form data
    const [createForm, setCreateForm] = useState<CreateLinkForm>({
        slug: '',
        title: '',
        description: '',
        keyWord: '',
        urls: [], // Start with one empty link input
    });

    const [currLink, setCurrLink] = useState<string>('');


    // State for submission process
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);


      const [slugStatus, setSlugStatus] = useState<{
        isChecking: boolean;
        message: string;
        isAvailable: boolean;
      }>({ isChecking: false, message: '', isAvailable: false });
    

    // Debounce the slug input to avoid excessive API calls
    const debouncedSlugCheck = useDebounceCallback(setSlug, 500);


    // Effect to trigger the debounced slug check when the slug changes

    useEffect(() => {
        const checkUsernameUnique = async () => {
            if (slug.length >= 3) {
                setSlugStatus({ isChecking: true, message: '', isAvailable: false });
                try {
                    const response = await fetch(`/api/check-slug-unique?slug=${slug}`);
                    const data = await response.json();
                    setSlugStatus({ isChecking: false, message: data.message, isAvailable: data.success });
                } catch (error) {
                    setSlugStatus({ isChecking: false, message: "Error checking username availability", isAvailable: false });
                }
            } else {
                setSlug("");
            }
        };
        checkUsernameUnique();
    }, [slug]);
    // --- HANDLERS ---

    // Authorization handler
    const handleAuthorize = async (key: string) => {
        setIsCheckingAuth(true);
        setAuthError(null);

        try {
            const response = await fetch(`/api/authorize?key=${encodeURIComponent(key)}&slug=${encodeURIComponent(id as string)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const linkData = await response.json();
                setIsAuthorized(true);
                setAuthKey(key);
                setCreateForm(linkData);
            } else {
                setAuthError('Invalid authorization key or collection not found');
            }
        } catch (error) {
            setAuthError('Failed to verify authorization. Please try again.');
            console.error('Authorization error:', error);
        } finally {
            setIsCheckingAuth(false);
        }
    };

    // Generic handler for simple text inputs and textareas
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCreateForm(prev => ({ ...prev, [name]: value }));
    };


    // Handler to remove a link input at a specific index
    const handleRemoveLink = (index: number) => {
        const newLinks = createForm.urls.filter((_, i) => i !== index);
        setCreateForm(prev => ({ ...prev, urls: newLinks }));
    };

    // Handler to update the collection
    const handleUpdateCollection = async () => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const response = await fetch('/api/links', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...createForm,
                    key: authKey,
                    originalSlug: id
                }),
            });

            if (response.ok) {
                const updatedLink = await response.json();
                router.push(`/${updatedLink.slug}`);
            } else {
                const errorData = await response.json();
                setSubmitError(errorData.message || 'Failed to update collection');
            }
        } catch (error) {
            setSubmitError('Failed to update collection. Please try again.');
            console.error('Update error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        // Add the curr link in links array whenever user press CTRL + Enter
        if (!currLink.startsWith("http://") && !currLink.startsWith("https://")) {
            setCurrLink('https://' + currLink);
        }
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey && e.key === 'Enter') || (e.key === 'Enter')) {
                e.preventDefault();
                if (currLink.trim() !== '') {
                    console.log(createForm.urls)
                    console.log(createForm.urls.includes(currLink))
                    if (createForm.urls.includes(currLink)) {
                        console.warn('Link already exists:', currLink);
                    } else {
                        setCreateForm(prev => ({ ...prev, urls: [...prev.urls, currLink] }));
                    }
                    setCurrLink('');
                }
            }

            if (e.ctrlKey && e.key === "v") {
                e.preventDefault();
                navigator.clipboard.readText().then(text => {
                    if (text) {
                        if (text.startsWith("http://") || text.startsWith("https://")) {
                            setCurrLink(text);
                        } else {
                            setCurrLink('https://' + text);
                        }
                    }
                });
            }

        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currLink])

    // Show authorization component if not authorized
    if (!isAuthorized) {
        return (
            <div className="min-h-screen w-full overflow-hidden">
                {authError && (
                    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md z-50">
                        {authError}
                    </div>
                )}
                {isCheckingAuth ? (
                    <div className="flex items-center justify-center min-h-screen">
                        <LoaderPinwheelIcon className="animate-spin mr-2" />
                        <span>Verifying authorization...</span>
                    </div>
                ) : (
                    <Authorization onAuthorize={handleAuthorize} />
                )}
            </div>
        );
    }

    // --- RENDER ---

    return (<>
        <div className=' min-h-screen w-full font-sans flex flex-col relative justify-start items-center pt-3 overflow-hidden'>

            {/* Header */}
            <div className='screen-line-after screen-line-before p-2 w-full text-3xl font-semibold max-w-4xl border-x border-edge'>
                Craft Your Collection
            </div>
            <div className='screen-line-after px-3 py-1 w-full font-light max-w-4xl border-x border-edge'>
                Assemble and share your links with a touch of elegance
            </div>

            <div className='screen-line-after bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] [--pattern-foreground:var(--color-edge)]/56 max-w-4xl w-full mx-auto text-center h-5 border-x border-edge'>
            </div>
            {/* Title and Slug */}
            <div className='border-x screen-line-after border-edge p-1 min-h-full max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-3 relative overflow-hidden'>
                <div className='h-full col-span-1 flex text-neutral-700 dark:text-neutral-50'>
                    <label htmlFor="title">Title *</label>
                </div>
                <div className='h-full w-px bg-edge absolute left-0 right-0 mx-auto'></div>
                <div className='h-full col-span-1 flex text-neutral-700 dark:text-neutral-50'>
                    <label htmlFor="slug">Slug *</label>
                </div>
            </div>
            <div className='border-x screen-line-after border-edge min-h-full max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-3 relative'>
                <div className='h-full col-span-1  flex text-lg text-neutral-700 dark:text-neutral-50'>
                    <input type="text" id='title' name='title' value={createForm.title} onChange={handleChange} placeholder="e.g., My Design Resources" required
                        className='w-full h-full p-2 focus:outline-none'
                    />
                </div>
                <div className='h-full w-px bg-edge absolute left-0 right-0 mx-auto'></div>

                <div className='h-full col-span-1 flex text-lg text-neutral-700 dark:text-neutral-50'>
                    {createForm.slug}
                </div>
            </div>

            <div className='screen-line-after bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] [--pattern-foreground:var(--color-edge)]/56 max-w-4xl w-full mx-auto text-center h-5 border-x border-edge'>
            </div>

            {/* Description and Keyword */}
            <div className='border-x screen-line-after border-edge p-1 min-h-full max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-3 relative overflow-hidden'>
                <div className='h-full col-span-1 flex text-neutral-700 dark:text-neutral-50'>
                    <label htmlFor="description">Description</label>
                </div>
                <div className='h-full w-px bg-edge absolute left-0 right-0 mx-auto'></div>
                <div className='h-full col-span-1 flex text-neutral-700 dark:text-neutral-50'>
                    <label htmlFor="keyword">Key *</label>
                </div>
            </div>
            <div className='border-x screen-line-after border-edge min-h-full max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-3 relative'>
                <div className='h-full col-span-1  flex text-lg text-neutral-700 dark:text-neutral-50'>
                    <textarea
                        rows={1}
                        id='description' value={createForm.description} name='description' onChange={handleChange} placeholder="e.g., A collection of my favorite design resources" required
                        className='w-full h-full p-2 focus:outline-none'
                    />
                </div>
                <div className='h-full w-px bg-edge absolute left-0 right-0 mx-auto'></div>
                <div className='h-full col-span-1 flex text-lg text-neutral-700 dark:text-neutral-50'>
                    <input type="password" id='keyword' minLength={5} maxLength={12} value={createForm.keyWord} name='keyWord' onChange={handleChange} placeholder="e.g., mysecretkeyword" required
                        className='w-full h-full p-2 focus:outline-none'
                    />
                </div>
            </div>

            <div className='screen-line-after bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] [--pattern-foreground:var(--color-edge)]/56 max-w-4xl w-full mx-auto text-center h-10 border-x border-edge'>
            </div>

            {/* Add Link Input */}

            <div className='screen-line-after min-h-full w-full max-w-4xl relative'>
                <div className='h-full p-3 w-full flex justify-center gap-4 text-lg text-neutral-700 dark:text-neutral-50 border-x border-edge'>
                    <input
                        type='url'
                        id='currLink' value={currLink} onChange={(e) => {
                            setCurrLink(e.target.value);
                        }} placeholder="e.g., A collection of my favorite design resources" required
                        className='w-full max-w-xl h-full p-2 focus:outline-none border-b '
                    />
                    <button onClick={() => {
                        if (currLink.length > 10) {

                            if (createForm.urls.includes(currLink)) {
                                alert('Link already exists: ' + currLink);
                            } else {
                                setCreateForm(prev => ({ ...prev, urls: [...prev.urls, currLink] }));
                            }
                            setCurrLink('');
                        }
                    }}
                        disabled={isSubmitting || !(currLink.trim().length > 10)}
                        className='btn btn-ghost rounded-xl'
                    >
                        Add
                    </button>
                </div>
            </div>
            <div className='screen-line-after bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] [--pattern-foreground:var(--color-edge)]/56 max-w-4xl w-full mx-auto text-center h-5 border-x border-edge'>
            </div>

            {
                createForm.urls && createForm.urls.map((link, index) => (
                    <div key={index} className='group screen-line-after min-h-full max-w-4xl w-full gap-3 relative'>
                        <Viewer url={link} />
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemoveLink(index)}
                            className="opacity-0 group-hover:opacity-100 cursor-pointer p-3 absolute -top-2 -right-10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                            aria-label="Remove link"
                        >
                            <X size={25} />
                        </motion.button>
                    </div>
                ))
            }
            <div className="absolute bottom-3 right-3 w-full flex justify-end">
                {submitError && (
                    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md z-50">
                        {submitError}
                    </div>
                )}
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit"
                    className='btn btn-ghost rounded-lg'
                    onClick={handleUpdateCollection}
                    disabled={isSubmitting || !createForm.keyWord || !createForm.title || !createForm.slug || !createForm.urls.length}
                >
                    {isSubmitting ? (
                        <> <LoaderPinwheelIcon className="animate-spin" /> Updating... </>
                    ) : (
                        <> <FiTag /> Update Collection </>
                    )}
                </motion.button>
            </div>

        </div>
        <Footer showBuild={true} />
    </>
    )
}


export default EditPage;