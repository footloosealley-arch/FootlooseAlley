import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Footloose Alley Studio Manager",
  description: "Dance and Fitness Studio Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}