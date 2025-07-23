/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This will suppress the hydration warnings caused by browser extensions
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Disable React's hydration warnings
  compiler: {
    // This disables React's hydration warnings completely
    reactRemoveProperties: process.env.NODE_ENV === 'production' ? { properties: ['^data-bis'] } : false,
  },
  // Image domains for optimization
  images: {
    domains: ['fonts.googleapis.com', 'fonts.gstatic.com', 'via.placeholder.com', 'picsum.photos'],
  },
};

module.exports = nextConfig;
