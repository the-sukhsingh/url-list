'use client';

import { useState } from 'react';
import { UrlPreview } from './UrlPreview';

export const UrlPreviewExample = () => {
    const [url, setUrl] = useState('https://github.com');

    const exampleUrls = [
        'https://github.com',
        'https://nextjs.org',
        'https://tailwindcss.com',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://stackoverflow.com',
    ];

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">URL Preview Component</h2>
                <p className="text-gray-600 mb-6">
                    Enter a URL to see the beautiful preview component in action.
                </p>
            </div>

            {/* URL Input */}
            <div className="space-y-2">
                <label htmlFor="url-input" className="block text-sm font-medium text-gray-700">
                    Enter URL
                </label>
                <input
                    id="url-input"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Quick Examples */}
            <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Quick examples:</p>
                <div className="flex flex-wrap gap-2">
                    {exampleUrls.map((exampleUrl) => (
                        <button
                            key={exampleUrl}
                            onClick={() => setUrl(exampleUrl)}
                            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            {new URL(exampleUrl).hostname}
                        </button>
                    ))}
                </div>
            </div>

            {/* Preview */}
            {url && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Preview:</p>
                    <UrlPreview url={url} />
                </div>
            )}
        </div>
    );
};