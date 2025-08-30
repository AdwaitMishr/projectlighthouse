import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/sonner";


import { Providers } from "./providers";
import Header from "./_components/Header";

export const metadata: Metadata = {
  title: "Project Lighthouse Console",
  description: "Guide the way for those in need",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
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
