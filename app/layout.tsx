import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Footloose Alley Studio Manager",
  description: "Secure dance and fitness studio operations system.",
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