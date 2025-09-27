import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: { id: string } }) {
    try {
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'https://url.sukhjitsingh.me'}/api/links?slug=${params.id}`, {
            cache: 'no-store'
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch link data');
        }
        
        const link = await response.json();
        
        return new ImageResponse(
            (
                <div
                    style={{
                        fontSize: 128,
                        background: 'white',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {link?.title || 'Link'}
                </div>
            ),
            {
                ...size,
            }
        );
    } catch (error) {
        // Return a fallback image in case of error
        return new ImageResponse(
            (
                <div
                    style={{
                        fontSize: 128,
                        background: 'white',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    Link Preview
                </div>
            ),
            {
                ...size,
            }
        );
    }
}