import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const editorSite =
  process.env.NEXT_PUBLIC_EDITOR_SITE_URL ||
  process.env.NEXT_PUBLIC_PUBLIC_ASSETS_URL ||
  'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ['192.168.1.9'],
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${editorSite.replace(/\/$/, '')}/uploads/:path*`,
      },
    ]
  },
}

export default nextConfig
