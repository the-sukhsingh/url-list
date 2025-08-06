import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        // Validate URL
        new URL(url);

        // Fetch the webpage with better headers
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            },
            // Add timeout and follow redirects
            signal: AbortSignal.timeout(15000),
            redirect: 'follow',
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();

        // Extract metadata using regex (basic implementation)
        const metadata = extractMetadata(html, url);

        return NextResponse.json(metadata);
    } catch (error) {
        console.error('Error fetching metadata:', error);
        return NextResponse.json(
            { error: 'Failed to fetch metadata' },
            { status: 500 }
        );
    }
}

function extractMetadata(html: string, url: string) {
    const domain = new URL(url).hostname;

    // Decode HTML entities
    const decodeHtml = (text: string) => {
        return text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .trim();
    };

    // More flexible meta tag extraction that handles different attribute orders
    const getMetaContent = (property: string, attribute: string = 'property') => {
        // Try different patterns to handle various attribute orders
        const patterns = [
            new RegExp(`<meta[^>]*${attribute}=["']${property}["'][^>]*content=["']([^"']*?)["'][^>]*>`, 'i'),
            new RegExp(`<meta[^>]*content=["']([^"']*?)["'][^>]*${attribute}=["']${property}["'][^>]*>`, 'i'),
            new RegExp(`<meta[^>]*${attribute}="${property}"[^>]*content="([^"]*?)"[^>]*>`, 'i'),
            new RegExp(`<meta[^>]*content="([^"]*?)"[^>]*${attribute}="${property}"[^>]*>`, 'i'),
        ];

        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match && match[1]) {
                return decodeHtml(match[1]);
            }
        }
        return null;
    };

    // Extract content from HTML tags with better handling
    const getTagContent = (tag: string) => {
        const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
        const match = html.match(regex);
        if (match && match[1]) {
            // Remove nested tags and clean up
            const content = match[1].replace(/<[^>]*>/g, '').trim();
            return decodeHtml(content);
        }
        return null;
    };

    // Extract title with more fallbacks
    let title = getMetaContent('og:title') ||
        getMetaContent('twitter:title') ||
        getMetaContent('title', 'name') ||
        getTagContent('title') ||
        domain;

    // Extract description with more sources
    let description = getMetaContent('og:description') ||
        getMetaContent('twitter:description') ||
        getMetaContent('description', 'name') ||
        getMetaContent('twitter:card') ||
        null;


    // Extract site name with more options
    let siteName = getMetaContent('og:site_name') ||
        getMetaContent('application-name', 'name') ||
        getMetaContent('apple-mobile-web-app-title', 'name') ||
        domain;





    return {
        title: title?.substring(0, 200) || domain,
        description: description?.substring(0, 300) || null,
        siteName: siteName?.substring(0, 100) || domain,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        domain,
    };
}