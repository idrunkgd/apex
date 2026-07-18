/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  serverExternalPackages: ["@react-pdf/renderer", "sharp"],
  experimental: {
    serverActions: { bodySizeLimit: "12mb" },
  },
};
export default nextConfig;
