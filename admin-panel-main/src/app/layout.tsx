import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono'; // No longer used if package was removed
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = GeistSans;
// const geistMono = GeistMono; // No longer used

export const metadata: Metadata = {
  title: 'پنل مدیریت یووتاب', // Reservista Admin
  description: 'پنل مدیریت برای سیستم رزرواسیون رستوران', // Admin Panel for Restaurant Reservation System
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
