import "@/styles/globals.css";

import { type Metadata } from "next";
import { Fira_Sans } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/sonner";


import { Providers } from "./providers";
import Header from "./_components/Header";

export const metadata: Metadata = {
  title: "Project Lighthouse Console",
  description: "Guide the way for those in need",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

// const geist = Geist({
//   subsets: ["latin"],
//   variable: "--font-geist-sans",
// });

const firaSans = Fira_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '700'],
  variable: '--font-fira-sans',  
})

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${firaSans.className}`}>
      <body className='dark'>
        <TRPCReactProvider>
          <Providers>
            <Header/>
            {children}
            </Providers>
          <Toaster position="top-left" />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
