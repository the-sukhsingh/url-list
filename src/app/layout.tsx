import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/context/AuthProvider";

export const metadata: Metadata = {
  title: "URL List - Share Multiple Links with One Short URL",
  description: "URL List helps you share multiple links with one easy-to-remember URL. Create custom slugs for your collection of links.",
  icons: {
    icon: '/favicon.ico',
  },
  applicationName: "URL List",
  keywords: "URL List, share links, multiple links, short URL, custom slug, link collection",
  authors: [{ name: "Sukhjit Singh", url: "https://sukhjitsingh.me" }],
  creator: "Sukhjit Singh",
  openGraph: {
    title: "URL List - Share Multiple Links with One Short URL",
    description: "URL List helps you share multiple links with one easy-to-remember URL. Create custom slugs for your collection of links.",
    url: "https://url-list-by-sukh.vercel.app/",
    siteName: "URL List",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "URL List Open Graph Image",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "URL List - Share Multiple Links with One Short URL",
    description: "URL List helps you share multiple links with one easy-to-remember URL. Create custom slugs for your collection of links.",
    images: ["/og-image.png"],
    creator: "@thesukhjitbajwa",
  },

};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0F172A" />
        <meta property="og:title" content="URL List - Share Multiple Links with One Short URL" />
        <meta property="og:description" content="URL List helps you share multiple links with one easy-to-remember URL. Create custom slugs for your collection of links." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="keywords" content="URL List, share links, multiple links, short URL, custom slug, link collection" />
        <meta name="author" content="Sukhjit Singh" />
        <meta name="application-name" content="URL List" />
        <meta name="url" content="https://url-list-by-sukh.vercel.app/" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      
      <body className="min-h-screen selection:bg-accent selection:text-white">
        <AuthProvider>

          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
