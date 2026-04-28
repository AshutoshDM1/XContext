import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { QueryProvider } from '@/components/providers/query-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/shared/Navbar/Navbar';
import Footer from '@/shared/Footer/Footer';
import { ThemeToggle } from '@/components/theme-toggle';

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'XContext',
  description: 'XContext is a platform for taking AI interview of given Codebase.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn('h-full', 'antialiased', 'font-mono', jetbrainsMono.variable)}
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <Toaster richColors position="top-right" />
            <ThemeToggle />
            <main className="min-h-dvh">
              <Navbar />
              <div className="min-h-[85vh]">{children}</div>
              <Footer />
            </main>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
