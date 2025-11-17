'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import Sidebar from "./components/sidebar";
import Header from "./components/header";
import PageTransition from "./components/page-transition";
import { UserStatusProvider } from "./contexts/user-status-context";

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

  // Generate page title based on current path
  const getPageTitle = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) {
      return 'Home';
    }
    
    const pageNames: { [key: string]: string } = {
      'conversations': 'Conversations',
      'teams': 'Teams',
      'meetings': 'Meetings',
      'files': 'Files',
      'whiteboard': 'Whiteboard',
      'activity': 'Activity',
      'settings': 'Settings',
      'admin': 'Administration'
    };
    
    const pageName = pageNames[pathSegments[0]] || pathSegments[0];
    return pageName.charAt(0).toUpperCase() + pageName.slice(1);
  };

  const pageTitle = getPageTitle();
  const fullTitle = `Aether Meet | ${pageTitle}`;
  const description = `Aether Meet - ${pageTitle} page`;
  const ogUrl = `http://aether-meet.local:3000${pathname}`;

  return (
    <html lang="fr">
      <head>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={ogUrl} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <UserStatusProvider>
          <div className="flex h-screen bg-black">
            {/* Sidebar - Icônes uniquement */}
            <Sidebar isAdmin={false} />
            
            {/* Contenu principal avec Header */}
            <div className="flex-1 flex flex-col">
              {/* Header - Présent sur toutes les pages */}
              <Header />
              
              {/* Main Content - Page content */}
              <main className="flex-1 overflow-hidden bg-surface">
                <PageTransition>
                  {children}
                </PageTransition>
              </main>
            </div>
          </div>
        </UserStatusProvider>
      </body>
    </html>
  );
}