import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mehfil — Bollywood Radio | 1990–2020',
  description:
    'Three decades of Bollywood. Explore songs by decade and mood, create playlists, and listen right here with YouTube.',
  referrer: 'strict-origin-when-cross-origin',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
