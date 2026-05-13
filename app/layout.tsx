import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TicketHub — Your Gateway to Live Experiences',
  description: "Book Egypt's hottest concerts, VIP parties, and nightlife events. Secure payments and instant confirmation.",
  openGraph: {
    title: 'TicketHub — Your Gateway to Live Experiences',
    description: "Book Egypt's hottest concerts, VIP parties, and nightlife events.",
    url: 'https://tekthub.com',
    siteName: 'TicketHub',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{
        margin: 0, padding: 0,
        backgroundColor: '#F2F4F7',
        color: '#1A3C5E',
        fontFamily: 'Inter, sans-serif',
      }}>
        {children}
      </body>
    </html>
  )
}