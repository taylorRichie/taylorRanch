/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://wu.ly/reveal_gallery/api/:path*'
      }
    ]
  }
}

module.exports = nextConfig
