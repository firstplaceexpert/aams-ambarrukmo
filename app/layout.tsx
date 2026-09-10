import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: {
    default: 'AAMS – Ambarrukmo Asset Management System',
    template: '%s | AAMS',
  },
  description:
    'Sistem manajemen aset terpadu untuk Ambarrukmo Group Yogyakarta — hotel, mall, dan properti.',
  keywords: ['manajemen aset', 'ambarrukmo', 'asset management', 'yogyakarta'],
  icons: {
    icon: [
      { url: '/favicon.png?v=3', type: 'image/png' },
    ],
    shortcut: '/favicon.png?v=3',
    apple: '/favicon.png?v=3',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`h-full ${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png?v=3" />
        <link rel="shortcut icon" type="image/png" href="/favicon.png?v=3" />
        <link rel="apple-touch-icon" href="/favicon.png?v=3" />
      </head>
      <body className={`${inter.className} h-full`}>{children}</body>
    </html>
  )
}
