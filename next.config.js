/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    appDir: true,
  },
  env: {
    NETWORK : "goerli",
    INFURA_API_KEY : "a41e2e51dff045a2aa46a6a7157ccf72",
    ALCHEMY_API_KEY : "MZEiaByikVJqltvDUOoxCBa5xRDUT0e9",
    GRAPH_API_KEY : "5ca87daf993b060c116315daa3b2b9c3"
  }
}

module.exports = nextConfig
