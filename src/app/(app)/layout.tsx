import Navbar from "@/components/Navbar";
import {motion} from "motion/react"
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    


    return (
        <>
        <div className="relative">

            {/* <Navbar /> */}
            <main>
                {children}
                
            </main>
        </div>
        </>
    );
}
