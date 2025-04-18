"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/client";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

const Navbar = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Signed out successfully");
      router.push("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <nav className="w-full py-4 px-8 flex justify-between items-center border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
      
      <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.svg" alt="logo" width={38} height={32}></Image>
                <h2 className="text-primary-100">PrepWise</h2>
                </Link>
      <div className="flex gap-4">
        {loading ? (
          <span className="text-sm text-neutral-400">Loading...</span>
        ) : user ? (
          <>
            <span className="text-sm text-neutral-400 self-center">
              {user.email}
            </span>
            <Button variant="outline" onClick={handleSignOut} className="border-neutral-800 hover:bg-neutral-800">
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" asChild className="border-neutral-800 hover:bg-neutral-800">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild className="bg-neutral-200 text-neutral-900 hover:bg-neutral-300">
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 