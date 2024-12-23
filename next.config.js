/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'revealgallery.nyc3.cdn.digitaloceanspaces.com',
      'revealgallery.nyc3.digitaloceanspaces.com'
    ],
  },
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
