import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "IoT Platform - Device Management & Analytics",
  description: "Comprehensive IoT platform for device management, real-time monitoring, and analytics.",
  keywords: ["IoT", "device management", "analytics", "monitoring", "dashboard"],
  authors: [{ name: "IoT Platform Team" }],
  creator: "IoT Platform",
  publisher: "IoT Platform",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "IoT Platform",
    title: "IoT Platform - Device Management & Analytics",
    description: "Comprehensive IoT platform for device management, real-time monitoring, and analytics.",
  },
  twitter: {
    card: "summary_large_image",
    title: "IoT Platform - Device Management & Analytics",
    description: "Comprehensive IoT platform for device management, real-time monitoring, and analytics.",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
