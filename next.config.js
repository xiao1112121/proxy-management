/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    // Handle Node.js modules that are not available in the browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        path: false,
        zlib: false,
        querystring: false,
        child_process: false,
        cluster: false,
        dgram: false,
        dns: false,
        events: false,
        module: false,
        punycode: false,
        readline: false,
        repl: false,
        string_decoder: false,
        timers: false,
        tty: false,
        vm: false,
        worker_threads: false,
      }
    }
    return config
  },
}

module.exports = nextConfig