import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { AdminAuthProvider } from '@/context/admin-auth-context'
import { NotificationsProvider } from '@/context/notifications-context'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Editorial Admin Panel',
  description: 'Platform administration for Editorial news',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-mesh" aria-hidden />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AdminAuthProvider>
            <NotificationsProvider>
              {children}
              <Toaster richColors position="top-right" />
            </NotificationsProvider>
          </AdminAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
