
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <>
        <div className="relative">
            <main>
                {children}
            </main>
        </div>
        </>
    );
}
