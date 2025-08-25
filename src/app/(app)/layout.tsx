
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <>
        <div className="relative">
            <main className="px-2 md:p-0">
                {children}
            </main>
        </div>
        </>
    );
}
