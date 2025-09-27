import LinkPage from '@/components/ViewPage'
import React from 'react'
import { Metadata, ResolvingMetadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

interface LinkType {
  _id: string;
  urls: string[];
  title?: string;
  slug: string;
  userId: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const id = (await params).id;

    const response = await fetch(`${process.env.NEXTAUTH_URL || 'https://url.sukhjitsingh.me'}/api/links?slug=${id}`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      return {
        title: 'URL List',
        description: 'The requested link could not be found.'
      }
    }

    const link: LinkType = await response.json()

    const title = link.title || `Link Collection - ${link.slug}`
    const description = link.description || `A collection of ${link.urls.length} useful links`
    const siteName = 'URL List'

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        siteName,
        url: `${process.env.NEXTAUTH_URL || 'https://url.sukhjitsingh.me'}/${id}`,
        images: [
          {
            url: '/og-image.png',
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/og-image.png'],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'URL List',
      description: 'A curated collection of useful links'
    }
  }
}

const Page = async ({ params }: PageProps) => {
  const id = (await params).id;
  return (
    <LinkPage id={id} />
  )
}

export default Page