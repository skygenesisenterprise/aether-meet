'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import Sidebar from "./components/sidebar";
import FolderSection from "./components/folder-section";
import Header from "./components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex h-screen bg-black">
          {/* Sidebar - Icônes uniquement */}
          <Sidebar isAdmin={false} />
          
          {/* Contenu principal avec Header */}
          <div className="flex-1 flex flex-col">
            {/* Header - Présent sur toutes les pages */}
            <Header />
            
            <div className="flex flex-1 overflow-hidden">
              {/* Folder Section - Navigation intermédiaire (sauf page d'accueil) */}
              {!isHomePage && <FolderSection isAdmin={false} />}
              
              {/* Main Content - Page content */}
              <main className={`overflow-auto bg-surface ${isHomePage ? 'flex-1' : 'flex-1'}`}>
                {children}
              </main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}