import { isAuthenticaed } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

const RootLayout=async ({children}:{children:ReactNode})=>{
    const isUserAuthenticated=await isAuthenticaed();
    if(!isUserAuthenticated){
        redirect('/sign-in');
    }
    return (
        <div className="root-layout">
            <nav>
                <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.svg" alt="logo" width={38} height={32}></Image>
                <h2 className="text-primary-100">PrepWise</h2>
                </Link>
                {children}
            </nav>
            
        </div>
    )
}
export default RootLayout;