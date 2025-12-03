import { AppProviders } from "@/components/providers/AppProviders";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const hnd = localFont({
  src: [
    {
      path: "../../public/fonts/helvetica-now-display/HelveticaNowDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/helvetica-now-display/HelveticaNowDisplay-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/helvetica-now-display/HelveticaNowDisplay-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-helvetica-now-display",
  display: "swap",
  preload: true,
});
export const metadata: Metadata = {
  title: "Powder",
  description:
    "Empowering healthcare providers, TPAs, and HMOs with intelligent claims vetting that accelerates settlements, ensures transparent payments, and strengthens trust among patients and enrollees.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    other: [{ rel: "manifest", url: "/site.webmanifest" }],
  },
  openGraph: {
    title: "Powder",
    description:
      "Empowering healthcare providers, TPAs, and HMOs with intelligent claims vetting that accelerates settlements, ensures transparent payments, and strengthens trust among patients and enrollees.",
    url: "https://powder.health",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${hnd.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
        <Toaster />
      </body>
    </html>
  );
}
