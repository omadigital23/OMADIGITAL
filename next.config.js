/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/fr',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig