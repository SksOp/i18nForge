import type { Metadata } from 'next';

import { ClientLayout } from './client-layout';
import './globals.css';

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: 'i18nForge',
  description: 'Seamless i18n Management for Your Website',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        className="no-scrollbar"
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
