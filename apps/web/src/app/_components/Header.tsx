"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@daveyplate/better-auth-ui";
import { useRouter } from "next/navigation";

export default function Header() {
    const router = useRouter();
    return (
        <header className="flex items-center justify-center relative top-0 left-0 right-0 z-50 p-4 bg-foreground/90 backdrop-blur-md dark:bg-background/40">
            <Link href="/">
                <div className="flex items-center gap-2 place-self-center">
                    <Image src="/project-lighthouse-logo-sm.svg" alt="Project Lighthouse logo" width={32} height={32} />
                </div>
            </Link>
            <nav className="hidden md:flex items-center gap-6 absolute right-4">
                <SignedOut>
                    <Link href="/auth/sign-in">
                        <Button variant="outline" size="sm">
                            Log In
                        </Button>
                    </Link>
                    <Link href="/auth/sign-up">
                        <Button size="sm">Sign Up</Button>
                    </Link>
                </SignedOut>
                <SignedIn>
                    <Button variant="outline" size="sm" onClick={() => { router.push("/auth/sign-out") }}>
                        Log Out
                    </Button>
                </SignedIn>
            </nav>
        </header>
    );
}