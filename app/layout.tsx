import type { Metadata } from "next";
import "./globals.css";
import { headers } from 'next/headers';
import { generateThemeFromHost } from '@/utils/styleUtils';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const theme = generateThemeFromHost(host);

  return (
    <html lang="en">
      <head>
        <style>{`
          :root {
            --primary-color: ${theme.primary};
            --secondary-color: ${theme.secondary};
            --accent-color: ${theme.accent};
            --background-color: ${theme.background};
            --text-color: ${theme.text};
            --font-family: ${theme.fontFamily};
            --border-radius: ${theme.borderRadius};
            --spacing: ${theme.spacing};
          }

          body {
            background-color: var(--background-color);
            color: var(--text-color);
            font-family: var(--font-family);
          }

          a {
            color: var(--primary-color);
          }

          h1, h2, h3, h4, h5, h6 {
            color: var(--primary-color);
          }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
