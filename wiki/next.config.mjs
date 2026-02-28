import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/docs/:path*",
      },
      {
        source: "/blog/:path*.mdx",
        destination: "/llms.mdx/blog/:path*",
      },
      {
        source: "/lore/:path*.mdx",
        destination: "/llms.mdx/lore/:path*",
      },
    ];
  },
};

export default withMDX(config);
