import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkLoaded, ClerkLoading, ClerkProvider } from "@clerk/nextjs";
import { LoadingPage } from "@/components/Loading";
import Navbar from "@/components/Navbar";
import Analytics from "@/components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pilotype - AI Autocomplete Tool",
  description: "Speed up your writing with Pilotype's AI-powered autocomplete.",
  openGraph: {
    title: "Pilotype - AI Autocomplete Tool",
    description:
      "Speed up your writing with Pilotype's AI-powered autocomplete.",
    url: "https://pilotype.com",
    images: [
      {
        url: "https://www.pilotype.com/pilotype-logo-t.png",
        width: 800,
        height: 600,
        alt: "Pilotype Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pilotype - AI Autocomplete Tool",
    description:
      "Speed up your writing with Pilotype's AI-powered autocomplete.",
    images: ["https://www.pilotype.com/pilotype-logo-t.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ClerkLoaded>
            <Analytics />
            <Navbar />
            {children}
          </ClerkLoaded>
          <ClerkLoading>
            <LoadingPage text="" />
          </ClerkLoading>
        </body>
      </html>
    </ClerkProvider>
  );
}
