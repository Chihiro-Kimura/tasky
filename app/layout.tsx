import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import '@/styles/globals.css';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans',
});

export const metadata: Metadata = {
  title: 'タスク管理アプリ',
  description: 'シンプルで使いやすいタスク管理アプリケーション',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="light" style={{ colorScheme: 'light' }}>
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          {children}
        </div>
      </body>
    </html>
  );
}
