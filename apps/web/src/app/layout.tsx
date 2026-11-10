
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import AppProviders from "@/providers/AppProviders";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "WorkSpace",
    template: "%s | WorkSpace",
  },
  description:
    "A modern workspace application.",
  applicationName: "WorkSpace",
  authors: [
    { name: "JGC Jamero Group of Companies" },
  ],
  creator: "JGC Jamero Group of Companies",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
