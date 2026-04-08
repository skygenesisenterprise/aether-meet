import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/context/Providers";
import "../styles/globals.css";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Aether Meet",
    default: "Aether Meet - The Official Meeting Platform of Aether",
  },
  description:
    "The Official Meeting Platform of Aether.",
  icons: {
    icon: [
      {
        url: "/astoria-flag.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${sourceSerif.variable} font-sans antialiased bg-white text-black`}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
