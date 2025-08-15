"use client"
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { useDebounceCallback } from 'usehooks-ts'
import { useRouter } from 'next/navigation'
import { FiTag } from 'react-icons/fi'
import { Viewer } from '@/components/Viewer'
import { CircleCheckIcon,  CircleXIcon, LoaderPinwheelIcon, X } from 'lucide-react'
import Footer from '@/components/Footer'

// The main data structure for the link collection form
export interface CreateLinkForm {
  slug: string,
  title: string,
  description: string,
  keyWord: string,
  links: string[],
}


const BuildPage = () => {
  const router = useRouter();

  // --- STATE MANAGEMENT ---

  // Single state object for all form data
  const [createForm, setCreateForm] = useState<CreateLinkForm>({
    slug: '',
    title: '',
    description: '',
    keyWord: '',
    links: [], // Start with one empty link input
  });
  const [currLink, setCurrLink] = useState<string>('');
  const [slug, setSlug] = useState<string>('');

  // State for the slug availability check
  const [slugStatus, setSlugStatus] = useState<{
    isChecking: boolean;
    message: string;
    isAvailable: boolean;
  }>({ isChecking: false, message: '', isAvailable: false });

  // State for submission process
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  // Generic handler for simple text inputs and textareas
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({ ...prev, [name]: value }));
  };

  // Handler to remove a link input at a specific index
  const handleRemoveLink = (index: number) => {
    const newLinks = createForm.links.filter((_, i) => i !== index);
    setCreateForm(prev => ({ ...prev, links: newLinks }));
  };

  // Handler for form submission
  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    console.log("createform",createForm)

    // --- Validation ---
    if (!slugStatus.isAvailable) {
      setSubmitError('The custom URL slug is not available. Please choose another.');
      setIsSubmitting(false);
      return;
    }
    if (!createForm.title.trim() || !createForm.slug.trim() || !createForm.keyWord.trim()) {
      setSubmitError('Please fill in Title, Slug, and Authorization Key.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          urls: createForm.links,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create link collection.');
      }

      router.push(`/link/edit/${createForm.slug}`);
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred. Please try again.');
      console.error('Error creating link:', err);
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
          if (createForm.links.includes(currLink)) {
            alert('Link already exists: ' + currLink);
          } else {
            setCreateForm(prev => ({ ...prev, links: [...prev.links, currLink] }));
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
          <input type="text" id='slug' name='slug' value={createForm.slug} onChange={(e) => {
            setCreateForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') }))
            debouncedSlugCheck(e.target.value)
          }}  placeholder="e.g., my-design" required
            className='w-full h-full p-2 focus:outline-none'
          />
          {createForm.slug && (

          <div className='absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2'>
          {
            slugStatus.isAvailable ? (
              <CircleCheckIcon size={20} className='text-green-500' />
            ) : slugStatus.isChecking ? (
              <LoaderPinwheelIcon size={20} className='text-yellow-500 animate-spin' />
            ) : (
              <CircleXIcon size={20} className='text-red-500' />
            )
          }
        </div>
          )}
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

              if (createForm.links.includes(currLink)) {
                alert('Link already exists: ' + currLink);
              } else {
                setCreateForm(prev => ({ ...prev, links: [...prev.links, currLink] }));
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
        createForm.links && createForm.links.map((link, index) =>(
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
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          type="submit"
          className='btn btn-ghost rounded-lg'
          onClick={handleCreateLink}
          disabled={isSubmitting || !createForm.keyWord || !createForm.title || !createForm.slug || !createForm.links || !slugStatus.isAvailable} 
        >
          {isSubmitting ? (
            <> <LoaderPinwheelIcon className="animate-spin" /> Creating... </>
          ) : (
            <> <FiTag /> Create Collection </>
          )}
        </motion.button>
      </div>

    </div>
    <Footer showBuild={false} />
  </>
  )
}


export default BuildPage;