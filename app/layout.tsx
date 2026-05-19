import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TicketHub — Book Premium Events in Egypt',
  description: 'Egypt\'s most trusted nightlife & event booking platform. Secure concerts, VIP parties, and live events with instant QR tickets. Book now, pay via Vodafone Cash or InstaPay.',
  keywords: 'events, concerts, nightlife, Egypt, tickets, booking, VIP parties',
  openGraph: {
    title: 'TicketHub — Your Gateway to Live Experiences',
    description: 'Book Egypt\'s hottest concerts, VIP parties, and nightlife events. Secure payments and instant confirmation.',
    url: 'https://tekthub.com',
    siteName: 'TicketHub',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TicketHub — Book Premium Events',
    description: 'Egypt\'s trusted event booking platform with 5K+ verified users.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#0a0f1e" />
        <meta name="msapplication-TileColor" content="#0a0f1e" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        backgroundColor: '#0a0f1e',
        color: '#ffffff',
        fontFamily: 'Inter, sans-serif',
      }}>
        {children}
      </body>
    </html>
  )
}