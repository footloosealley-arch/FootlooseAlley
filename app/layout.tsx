import type { Metadata, Viewport } from "next";

import "./globals.css";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Footloose Alley Studio Manager",
    template: "%s | Footloose Alley",
  },
  description: "Secure dance and fitness studio operations system.",
  applicationName: "Footloose Alley",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {
        url: "/footloose-alley-logo.png",
        type: "image/png",
        sizes: "1024x1024",
      },
    ],
    apple: [
      {
        url: "/footloose-alley-logo.png",
        type: "image/png",
        sizes: "1024x1024",
      },
    ],
    shortcut: "/footloose-alley-logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Footloose Alley",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#b4233a",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <AuthProvider>{children}</AuthProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
